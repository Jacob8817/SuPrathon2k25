const fs = require("fs")
const fsExtra = require("fs-extra")
const path = require("path")
const os = require("os")
const uuidv4 = require("uuid").v4
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3")
const { pdfToText } = require("text-from-pdf")
const { minioClient } = require("../../config/s3")
const pool = require("../../config/db")
const multer = require("multer")

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Middleware to be used in route
exports.uploadMiddleware = upload.single("resume")

const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(chunks)))
    stream.on("error", (err) => reject(err))
  })
}

// Helper function to format arrays for PostgreSQL
const formatPostgreSQLArray = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return "{}"
  }

  // Escape single quotes and wrap each element in quotes
  const escapedElements = arr.map((item) => {
    if (typeof item !== "string") {
      item = String(item)
    }
    // Escape single quotes by doubling them
    const escaped = item.replace(/'/g, "''")
    return `"${escaped}"`
  })

  return `{${escapedElements.join(",")}}`
}

exports.extractTextFromObjectPdfWithPdfToText = async (req, res) => {
  const { bucketName, objectKey } = req.body

  if (!bucketName || !objectKey) {
    return res.status(400).json({ error: "bucketName and objectKey are required" })
  }

  const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.pdf`)
  const imagesDir = path.join(__dirname, "../../images")

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    })

    const response = await minioClient.send(command)
    const data = await streamToBuffer(response.Body)

    fs.writeFileSync(tempFilePath, data)
    const text = await pdfToText(tempFilePath)

    // Clean up temp file
    fs.unlinkSync(tempFilePath)

    // Clean up images directory
    if (fs.existsSync(imagesDir)) {
      const files = await fs.promises.readdir(imagesDir)
      for (const file of files) {
        const filePath = path.join(imagesDir, file)
        await fs.promises.unlink(filePath)
      }
    }

    return res.json({ text })
  } catch (error) {
    console.error("Error extracting text from PDF:", error)

    // Clean up temp file if it exists
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }

    return res.status(500).json({ error: "Failed to extract text from PDF" })
  }
}

exports.insertextractedText = async (req, res) => {
  const {
    studentid,
    programminglang,
    technologiesknown,
    class10percentage,
    class12percentage,
    cgpa,
    totalexperiences,
  } = req.body

  console.log("📥 Received data for insertion:", {
    studentid,
    programminglang,
    technologiesknown,
    class10percentage,
    class12percentage,
    cgpa,
    totalexperiences,
  })

  if (!studentid) {
    return res.status(400).json({ error: "studentid is required" })
  }

  try {
    // Format arrays for PostgreSQL
    const formattedProgrammingLang = formatPostgreSQLArray(programminglang)
    const formattedTechnologies = formatPostgreSQLArray(technologiesknown)

    console.log("🔄 Formatted arrays for PostgreSQL:", {
      formattedProgrammingLang,
      formattedTechnologies,
    })

    const query = `
            INSERT INTO resumedata.resume (
                studentid,
                programminglang,
                technologiesknown,
                class10percentage,
                class12percentage,
                cgpa,
                totalexperiences
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (studentid)
            DO UPDATE SET
                programminglang = EXCLUDED.programminglang,
                technologiesknown = EXCLUDED.technologiesknown,
                class10percentage = EXCLUDED.class10percentage,
                class12percentage = EXCLUDED.class12percentage,
                cgpa = EXCLUDED.cgpa,
                totalexperiences = EXCLUDED.totalexperiences
        `

    const values = [
      studentid,
      formattedProgrammingLang, 
      formattedTechnologies, 
      class10percentage || "",
      class12percentage || "",
      cgpa || "",
      totalexperiences || 0,
    ]

    console.log("🗃️ Executing query with values:", values)

    const result = await pool.query(query, values)

    console.log("✅ Database insert successful:", result.rowCount)

    res.status(200).json({
      message: "Resume data inserted/updated successfully.",
      rowsAffected: result.rowCount,
    })
  } catch (error) {
    console.error("❌ Error inserting resume data:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  }
}

exports.mixeddata = async (req, res) => {
  const { studentid } = req.query

  if (!studentid) {
    return res.status(400).json({ error: "studentid is required" })
  }

  try {
    const query = `
            SELECT * FROM resumedata.resume j
            JOIN auth.users u ON j.studentid = u.userid
            WHERE studentid = $1 
        `

    const result = await pool.query(query, [studentid])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No data found for the given studentid" })
    }

    const data = result.rows[0]

    console.log("📤 Retrieved data from database:", {
      programminglang: data.programminglang,
      technologiesknown: data.technologiesknown,
    })

    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching resume data:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

exports.uploadPutResume = async (req, res) => {
  const { bucketName, studentid } = req.body

  if (!bucketName || !studentid || !req.file) {
    return res.status(400).json({
      error: "bucketName, studentid, and resume file are required",
    })
  }

  const objectKey = `${studentid}.pdf` // Use studentid as filename

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    })

    await minioClient.send(command)

    console.log(`✅ Resume uploaded successfully: ${objectKey}`)

    res.status(200).json({
      message: "Resume uploaded successfully",
      objectKey,
    })
  } catch (error) {
    console.error("❌ Error uploading resume:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  }
}
