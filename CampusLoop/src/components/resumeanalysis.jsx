"use client"
import { useState } from "react"
import axios from "axios"
import Sidebar from "./sidebar"
import { useUserStore } from "../store"

const ResumeAnalysis = () => {
  const userData = useUserStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [insertStatus, setInsertStatus] = useState("")
  const [error, setError] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [qualityAnalysis, setQualityAnalysis] = useState(null)
  const [qualityLoading, setQualityLoading] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [extractionAttempts, setExtractionAttempts] = useState(0)

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0])
    // Reset previous analysis when new file is selected
    setQualityAnalysis(null)
    setInsertStatus("")
    setError(null)
    setExtractedData(null)
    setRetryCount(0)
    setExtractionAttempts(0)
  }

  const analyzeResumeQuality = async (extractedText, parsedData) => {
    setQualityLoading(true)
    try {
      // Check for missing class 10/12 data - FIXED LOGIC
      const class10Missing =
        !parsedData.class_10?.percentage_or_grade ||
        parsedData.class_10.percentage_or_grade === "" ||
        parsedData.class_10.percentage_or_grade.trim() === ""

      const class12Missing =
        !parsedData.class_12?.percentage_or_grade ||
        parsedData.class_12.percentage_or_grade === "" ||
        parsedData.class_12.percentage_or_grade.trim() === ""

      const cgpaMissing = !parsedData.cgpa || parsedData.cgpa === "" || parsedData.cgpa.trim() === ""

      console.log("🔍 Education data check:", {
        class_10: parsedData.class_10?.percentage_or_grade,
        class_12: parsedData.class_12?.percentage_or_grade,
        cgpa: parsedData.cgpa,
        class10Missing,
        class12Missing,
        cgpaMissing,
      })

      const qualityResponse = await axios.post(
        "https://api.novita.ai/v3/openai/chat/completions",
        {
          model: "meta-llama/llama-3.2-1b-instruct",
          stream: false,
          response_format: { type: "text" },
          messages: [
            {
              role: "system",
              content: `You are a Resume Quality Analyzer. Analyze the resume text and provide detailed feedback on what's missing or can be improved. Pay special attention to education details including class 10 and 12 percentages. Return ONLY a valid JSON object with your analysis.`,
            },
            {
              role: "user",
              content: `Analyze this resume and provide feedback in the following JSON format. Pay special attention to education details:

{
  "overall_score": 85,
  "strengths": [
    "Clear contact information",
    "Relevant technical skills listed"
  ],
  "missing_elements": [
    "Professional summary/objective"
  ],
  "improvement_suggestions": [
    "Add a professional summary at the top"
  ],
  "section_analysis": {
    "contact_info": {
      "present": true,
      "quality": "good",
      "feedback": "Contact information is complete"
    },
    "summary": {
      "present": false,
      "quality": "missing",
      "feedback": "Consider adding a professional summary"
    },
    "experience": {
      "present": true,
      "quality": "fair",
      "feedback": "Experience section exists but lacks quantified achievements"
    },
    "education": {
      "present": true,
      "quality": "good",
      "feedback": "Education section is complete with all required details"
    },
    "skills": {
      "present": true,
      "quality": "good",
      "feedback": "Technical skills are clearly listed"
    },
    "projects": {
      "present": true,
      "quality": "fair",
      "feedback": "Projects are mentioned but could use more detail"
    }
  },
  "formatting_issues": [
    "Inconsistent date formats"
  ],
  "recommendations": [
    "Include action verbs in experience descriptions",
    "Consider adding relevant certifications"
  ],
  "education_completeness": {
    "class_10_present": true,
    "class_12_present": true,
    "cgpa_present": true,
    "missing_education_penalty": 0
  }
}

IMPORTANT ANALYSIS RULES:
- Check specifically for Class 10 and Class 12 percentages/grades
- Only deduct points if education data is actually missing
- Analyze all major resume sections: contact info, summary, experience, education, skills, projects, achievements
- Provide specific, actionable feedback
- Be constructive and helpful in suggestions

EXTRACTED EDUCATION DATA:
- Class 10: ${parsedData.class_10?.percentage_or_grade || "Not found"} (Board: ${parsedData.class_10?.board || "Not found"})
- Class 12: ${parsedData.class_12?.percentage_or_grade || "Not found"} (Board: ${parsedData.class_12?.board || "Not found"})
- CGPA: ${parsedData.cgpa || "Not found"}

Based on the extracted data above:
- Class 10 is ${class10Missing ? "MISSING" : "PRESENT"}
- Class 12 is ${class12Missing ? "MISSING" : "PRESENT"}  
- CGPA is ${cgpaMissing ? "MISSING" : "PRESENT"}

Resume text to analyze:
${extractedText}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer sk_5cHwR591DRbTDTNtgWToBaous4kzDi7cphudDn5dato`,
            "Content-Type": "application/json",
          },
        },
      )

      const qualityReply = qualityResponse.data.choices?.[0]?.message?.content || ""
      console.log("🔍 Quality analysis response:", qualityReply)

      // Clean and parse quality analysis
      let cleanedQuality = qualityReply
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()

      const qualityMatch = cleanedQuality.match(/\{[\s\S]*\}/)
      if (qualityMatch) {
        cleanedQuality = qualityMatch[0]
      }

      try {
        const qualityParsed = JSON.parse(cleanedQuality)

        // Enhance the analysis with our own checks - CORRECTED LOGIC
        const enhancedAnalysis = { ...qualityParsed }

        // Adjust score based on missing education data
        let scoreDeduction = 0
        const missingEducationElements = []
        const educationSuggestions = []

        if (class10Missing) {
          scoreDeduction += 8
          missingEducationElements.push("Class 10 percentage/grade")
          educationSuggestions.push("Add your Class 10 percentage with board name (e.g., CBSE, ICSE)")
          enhancedAnalysis.section_analysis = enhancedAnalysis.section_analysis || {}
          enhancedAnalysis.section_analysis.class_10 = {
            present: false,
            quality: "missing",
            feedback:
              "Class 10 percentage is missing - this is required for most job applications and higher education",
          }
        } else {
          // Mark as present if found
          enhancedAnalysis.section_analysis = enhancedAnalysis.section_analysis || {}
          enhancedAnalysis.section_analysis.class_10 = {
            present: true,
            quality: "good",
            feedback: `Class 10 percentage found: ${parsedData.class_10.percentage_or_grade} (${parsedData.class_10.board})`,
          }
        }

        if (class12Missing) {
          scoreDeduction += 8
          missingEducationElements.push("Class 12 percentage/grade")
          educationSuggestions.push("Add your Class 12 percentage with board name and stream")
          enhancedAnalysis.section_analysis = enhancedAnalysis.section_analysis || {}
          enhancedAnalysis.section_analysis.class_12 = {
            present: false,
            quality: "missing",
            feedback: "Class 12 percentage is missing - this is crucial for academic and professional applications",
          }
        } else {
          // Mark as present if found
          enhancedAnalysis.section_analysis = enhancedAnalysis.section_analysis || {}
          enhancedAnalysis.section_analysis.class_12 = {
            present: true,
            quality: "good",
            feedback: `Class 12 percentage found: ${parsedData.class_12.percentage_or_grade} (${parsedData.class_12.board})`,
          }
        }

        if (cgpaMissing) {
          scoreDeduction += 6
          missingEducationElements.push("College CGPA/GPA")
          educationSuggestions.push("Include your college CGPA or percentage")
        }

        // Update the analysis with our enhancements
        enhancedAnalysis.overall_score = Math.max(0, (enhancedAnalysis.overall_score || 70) - scoreDeduction)

        // Only add missing elements if they're actually missing
        if (missingEducationElements.length > 0) {
          enhancedAnalysis.missing_elements = [
            ...(enhancedAnalysis.missing_elements || []),
            ...missingEducationElements,
          ]
          enhancedAnalysis.improvement_suggestions = [
            ...educationSuggestions,
            ...(enhancedAnalysis.improvement_suggestions || []),
          ]
        }

        // Add education-specific recommendations only if needed
        if (missingEducationElements.length > 0) {
          enhancedAnalysis.recommendations = [
            "Complete your education section with all academic percentages - this is crucial for ATS systems",
            ...(enhancedAnalysis.recommendations || []),
          ]
        }

        // Add education completeness tracking - CORRECTED
        enhancedAnalysis.education_completeness = {
          class_10_present: !class10Missing,
          class_12_present: !class12Missing,
          cgpa_present: !cgpaMissing,
          missing_education_penalty: scoreDeduction,
          education_score: Math.max(0, 100 - scoreDeduction * 3), // Education-specific score
        }

        setQualityAnalysis(enhancedAnalysis)
        console.log("✅ Enhanced quality analysis:", enhancedAnalysis)
      } catch (qualityParseError) {
        console.error("❌ Failed to parse quality analysis:", qualityParseError)
        // Provide a fallback analysis with education focus
        const fallbackAnalysis = {
          overall_score: class10Missing || class12Missing ? 50 : 70,
          strengths: ["Resume uploaded successfully"],
          missing_elements: [
            ...(class10Missing ? ["Class 10 percentage/grade"] : []),
            ...(class12Missing ? ["Class 12 percentage/grade"] : []),
            ...(cgpaMissing ? ["College CGPA"] : []),
          ],
          improvement_suggestions: [
            ...(class10Missing ? ["Add Class 10 percentage with board name"] : []),
            ...(class12Missing ? ["Add Class 12 percentage with board name"] : []),
            ...(cgpaMissing ? ["Include college CGPA or percentage"] : []),
            "Ensure resume is in clear, readable format",
          ],
          section_analysis: {
            ...(class10Missing && {
              class_10: {
                present: false,
                quality: "missing",
                feedback: "Class 10 percentage is missing - add it to improve your resume score",
              },
            }),
            ...(class12Missing && {
              class_12: {
                present: false,
                quality: "missing",
                feedback: "Class 12 percentage is missing - this is important for applications",
              },
            }),
            ...(!class10Missing && {
              class_10: {
                present: true,
                quality: "good",
                feedback: `Class 10 percentage found: ${parsedData.class_10.percentage_or_grade}`,
              },
            }),
            ...(!class12Missing && {
              class_12: {
                present: true,
                quality: "good",
                feedback: `Class 12 percentage found: ${parsedData.class_12.percentage_or_grade}`,
              },
            }),
          },
          formatting_issues: [],
          recommendations: [
            ...(class10Missing || class12Missing ? ["Complete education section with all academic percentages"] : []),
            "Education details are crucial for ATS systems and recruiters",
          ],
          education_completeness: {
            class_10_present: !class10Missing,
            class_12_present: !class12Missing,
            cgpa_present: !cgpaMissing,
            missing_education_penalty: (class10Missing ? 8 : 0) + (class12Missing ? 8 : 0) + (cgpaMissing ? 6 : 0),
          },
        }
        setQualityAnalysis(fallbackAnalysis)
      }
    } catch (qualityError) {
      console.error("❌ Quality analysis failed:", qualityError)
      setQualityAnalysis({
        overall_score: 0,
        strengths: [],
        missing_elements: ["Analysis failed"],
        improvement_suggestions: ["Please try again"],
        section_analysis: {},
        formatting_issues: [],
        recommendations: ["Check your internet connection and try again"],
        education_completeness: {
          class_10_present: false,
          class_12_present: false,
          cgpa_present: false,
          missing_education_penalty: 0,
        },
      })
    } finally {
      setQualityLoading(false)
    }
  }

  const extractDataFromResume = async (extractedText, attempt = 1) => {
    console.log(`🔄 Data extraction attempt ${attempt}/3`)

    const novitaResponse = await axios.post(
      "https://api.novita.ai/v3/openai/chat/completions",
      {
        model: "meta-llama/llama-3.2-1b-instruct",
        stream: false,
        response_format: { type: "text" },
        messages: [
          {
            role: "system",
            content: `You are a Resume JSON Extractor. Extract information from resume text and return ONLY a valid JSON object with the exact structure specified. No markdown, no explanations, just the JSON.`,
          },
          {
            role: "user",
            content: `Extract information from this resume and return ONLY this exact JSON structure. Make sure the JSON is valid with no duplicate keys:

{
  "programming_languages": ["Python", "Java", "C++"],
  "frontend_technologies": ["React", "Angular", "Vue.js"],
  "backend_technologies": ["Node.js", "Django", "Flask"],
  "databases": ["MySQL", "MongoDB", "PostgreSQL"],
  "class_10": {
    "board": "CBSE",
    "percentage_or_grade": "88%",
    "year": "2019"
  },
  "class_12": {
    "board": "CBSE", 
    "percentage_or_grade": "87%",
    "year": "2021"
  },
  "cgpa": "8.0",
  "experience_summary": [
    {
      "organization": "Company Name",
      "role": "Position Title", 
      "duration": "June - August 2024"
    }
  ],
  "total_internships_or_experiences": 1
}

CRITICAL EXTRACTION RULES:
- MUST extract Class 10 percentage/grade from education section
- MUST extract Class 12 percentage/grade from education section  
- MUST extract college CGPA/GPA from education section
- Look for percentages like "88%", "87%", "8.5 CGPA", "85.5%", etc.
- Look for education boards like CBSE, ICSE, State Board, etc.
- Return ONLY the JSON object above, nothing else
- Do NOT include any additional fields
- If any field is not found, use empty array [] or empty string ""
- Ensure the JSON is valid and can be parsed by JSON.parse()

Resume text:
${extractedText}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer sk_5cHwR591DRbTDTNtgWToBaous4kzDi7cphudDn5dato`,
          "Content-Type": "application/json",
        },
      },
    )

    const reply = novitaResponse.data.choices?.[0]?.message?.content || ""
    console.log(`🤖 Raw LLM response (attempt ${attempt}):`, reply)

    let cleaned = reply
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    // Check if the response is an array and extract the first object
    if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
      try {
        const arrayParsed = JSON.parse(cleaned)
        if (Array.isArray(arrayParsed) && arrayParsed.length > 0) {
          cleaned = JSON.stringify(arrayParsed[0])
          console.log("🔧 Extracted object from array:", cleaned)
        }
      } catch (arrayError) {
        console.log("⚠️ Failed to parse as array, continuing with original")
      }
    }

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }

    const fixedJson = cleaned
      .replace(
        /"(\w+)":\s*"([^"]*)",\s*"(\w+)":\s*"([^"]*)",\s*"\1":\s*"([^"]*)"/g,
        '"$1": "$2", "$3": "$4", "$1_additional": "$5"',
      )
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")

    let parsed
    try {
      parsed = JSON.parse(fixedJson)
      console.log(`✅ Successfully parsed JSON (attempt ${attempt}):`, parsed)
    } catch (parseError) {
      console.error(`❌ JSON Parse Error (attempt ${attempt}):`, parseError)
      try {
        const withoutExtracurriculars = fixedJson.replace(/,?\s*"extracurriculars":\s*\{[^}]*\}/g, "")
        const finalCleaned = withoutExtracurriculars.replace(/,(\s*})/g, "$1")
        parsed = JSON.parse(finalCleaned)
      } catch (secondError) {
        parsed = {
          programming_languages: [],
          frontend_technologies: [],
          backend_technologies: [],
          databases: [],
          class_10: { board: "", percentage_or_grade: "", year: "" },
          class_12: { board: "", percentage_or_grade: "", year: "" },
          cgpa: "",
          experience_summary: [],
          total_internships_or_experiences: 0,
        }
      }
    }

    // Ensure all required fields exist with defaults
    const finalData = {
      programming_languages: parsed.programming_languages || [],
      frontend_technologies: parsed.frontend_technologies || [],
      backend_technologies: parsed.backend_technologies || [],
      databases: parsed.databases || [],
      class_10: parsed.class_10 || { board: "", percentage_or_grade: "", year: "" },
      class_12: parsed.class_12 || { board: "", percentage_or_grade: "", year: "" },
      cgpa: parsed.cgpa || "",
      experience_summary: parsed.experience_summary || [],
      total_internships_or_experiences: parsed.total_internships_or_experiences || 0,
    }

    console.log(`📊 Final extracted data (attempt ${attempt}):`, finalData)
    return finalData
  }

  const handleUploadAndAnalyze = async () => {
    if (!resumeFile) {
      setError("Please select a resume PDF to upload")
      return
    }

    setLoading(true)
    setError(null)
    setInsertStatus("")
    setQualityAnalysis(null)
    setExtractionAttempts(0)

    try {
      // 1) Upload PDF
      const formData = new FormData()
      formData.append("resume", resumeFile)
      formData.append("bucketName", "resume")
      formData.append("studentid", userData.userid)

      await axios.post("http://localhost:3000/api/extractor/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // 2) Extract text
      const objectKey = `${userData.userid}.pdf`
      const extractResp = await axios.post("http://localhost:3000/api/extractor/extract", {
        bucketName: "resume",
        objectKey,
      })

      const extractedText = extractResp.data.text || ""
      console.log("📄 Extracted text length:", extractedText.length)

      // 3) Try to extract data with retry mechanism
      let finalData = null
      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        attempts++
        setExtractionAttempts(attempts)

        try {
          finalData = await extractDataFromResume(extractedText, attempts)

          // Check if education data is missing
          const class10Missing =
            !finalData.class_10?.percentage_or_grade ||
            finalData.class_10.percentage_or_grade === "" ||
            finalData.class_10.percentage_or_grade.trim() === ""

          const class12Missing =
            !finalData.class_12?.percentage_or_grade ||
            finalData.class_12.percentage_or_grade === "" ||
            finalData.class_12.percentage_or_grade.trim() === ""

          const cgpaMissing = !finalData.cgpa || finalData.cgpa === "" || finalData.cgpa.trim() === ""

          console.log(`🎓 Education check (attempt ${attempts}):`, {
            class10Missing,
            class12Missing,
            cgpaMissing,
            class_10: finalData.class_10?.percentage_or_grade,
            class_12: finalData.class_12?.percentage_or_grade,
            cgpa: finalData.cgpa,
          })

          // If all education data is present, break the loop
          if (!class10Missing && !class12Missing && !cgpaMissing) {
            console.log(`✅ All education data found on attempt ${attempts}`)
            break
          }

          // If this is the last attempt, use what we have
          if (attempts === maxAttempts) {
            console.log(`⚠️ Using data from final attempt ${attempts} (some education data may be missing)`)
            break
          }

          console.log(`🔄 Education data incomplete, retrying... (attempt ${attempts}/${maxAttempts})`)
        } catch (extractError) {
          console.error(`❌ Extraction failed on attempt ${attempts}:`, extractError)
          if (attempts === maxAttempts) {
            throw extractError
          }
        }
      }

      if (!finalData) {
        throw new Error("Failed to extract data after all attempts")
      }

      // Store extracted data
      setExtractedData(finalData)

      // 4) Combine technologies for the database
      const allTechnologies = [
        ...finalData.frontend_technologies,
        ...finalData.backend_technologies,
        ...finalData.databases,
      ]

      // 5) Insert into database
      const insertResponse = await axios.post("http://localhost:3000/api/extractor/insert", {
        studentid: userData.userid,
        programminglang: finalData.programming_languages,
        technologiesknown: allTechnologies,
        class10percentage: finalData.class_10.percentage_or_grade,
        class12percentage: finalData.class_12.percentage_or_grade,
        cgpa: finalData.cgpa,
        totalexperiences: finalData.total_internships_or_experiences,
      })

      setInsertStatus(insertResponse.data.message || "Resume data saved successfully")

      // 6) Analyze resume quality with extracted data
      await analyzeResumeQuality(extractedText, finalData)
    } catch (err) {
      console.error("❌ Error in resume processing:", err)
      setError(err.response?.data?.error || err.message || "Resume processing failed")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSectionQualityColor = (quality) => {
    switch (quality) {
      case "good":
      case "excellent":
        return "text-green-600"
      case "fair":
      case "average":
        return "text-yellow-600"
      case "poor":
      case "missing":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar role={userData.role} />
      <div className="p-8 flex-1 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Upload Resume for Analysis</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUploadAndAnalyze}
          disabled={loading || !resumeFile}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing Resume..." : "Upload and Analyze"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {insertStatus && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              <strong>Success:</strong> {insertStatus}
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">
              Processing your resume... This may take a few moments.
              {extractionAttempts > 0 && (
                <span className="block text-sm mt-1">Data extraction attempt: {extractionAttempts}/3</span>
              )}
            </p>
          </div>
        )}

        {qualityLoading && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-700">Analyzing resume quality... Please wait.</p>
          </div>
        )}

        {/* Display extracted data for debugging */}
        {extractedData && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Extracted Data:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Class 10:</strong> {extractedData.class_10?.percentage_or_grade || "Not found"}
                {extractedData.class_10?.board && ` (${extractedData.class_10.board})`}
              </p>
              <p>
                <strong>Class 12:</strong> {extractedData.class_12?.percentage_or_grade || "Not found"}
                {extractedData.class_12?.board && ` (${extractedData.class_12.board})`}
              </p>
              <p>
                <strong>CGPA:</strong> {extractedData.cgpa || "Not found"}
              </p>
              <p>
                <strong>Extraction Attempts:</strong> {extractionAttempts}/3
              </p>
            </div>
          </div>
        )}

        {qualityAnalysis && (
          <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Resume Quality Analysis</h3>

            {/* Overall Score */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-700">Overall Score:</span>
                <span className={`text-2xl font-bold ${getScoreColor(qualityAnalysis.overall_score)}`}>
                  {qualityAnalysis.overall_score}/100
                </span>
                {qualityAnalysis.education_completeness?.missing_education_penalty > 0 && (
                  <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                    -{qualityAnalysis.education_completeness.missing_education_penalty} pts (missing education)
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    qualityAnalysis.overall_score >= 80
                      ? "bg-green-500"
                      : qualityAnalysis.overall_score >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${qualityAnalysis.overall_score}%` }}
                ></div>
              </div>
            </div>

            {/* Education Completeness Alert */}
            {qualityAnalysis.education_completeness && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">🎓 Education Completeness Check</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div
                    className={`p-2 rounded text-center ${qualityAnalysis.education_completeness.class_10_present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    <div className="font-medium">Class 10</div>
                    <div className="text-sm">
                      {qualityAnalysis.education_completeness.class_10_present ? "✓ Present" : "✗ Missing"}
                    </div>
                    {extractedData?.class_10?.percentage_or_grade && (
                      <div className="text-xs mt-1">{extractedData.class_10.percentage_or_grade}</div>
                    )}
                  </div>
                  <div
                    className={`p-2 rounded text-center ${qualityAnalysis.education_completeness.class_12_present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    <div className="font-medium">Class 12</div>
                    <div className="text-sm">
                      {qualityAnalysis.education_completeness.class_12_present ? "✓ Present" : "✗ Missing"}
                    </div>
                    {extractedData?.class_12?.percentage_or_grade && (
                      <div className="text-xs mt-1">{extractedData.class_12.percentage_or_grade}</div>
                    )}
                  </div>
                  <div
                    className={`p-2 rounded text-center ${qualityAnalysis.education_completeness.cgpa_present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    <div className="font-medium">College CGPA</div>
                    <div className="text-sm">
                      {qualityAnalysis.education_completeness.cgpa_present ? "✓ Present" : "✗ Missing"}
                    </div>
                    {extractedData?.cgpa && <div className="text-xs mt-1">{extractedData.cgpa}</div>}
                  </div>
                </div>
                {qualityAnalysis.education_completeness.education_score && (
                  <div className="text-sm text-orange-700">
                    Education Section Score:{" "}
                    <span className="font-medium">{qualityAnalysis.education_completeness.education_score}/100</span>
                  </div>
                )}
              </div>
            )}

            {/* Strengths */}
            {qualityAnalysis.strengths && qualityAnalysis.strengths.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-green-700 mb-2">✅ Strengths</h4>
                <ul className="list-disc list-inside space-y-1">
                  {qualityAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700 text-sm">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Elements */}
        

            {/* Section Analysis */}
            {qualityAnalysis.section_analysis && Object.keys(qualityAnalysis.section_analysis).length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">📋 Section Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(qualityAnalysis.section_analysis).map(([section, analysis]) => (
                    <div
                      key={section}
                      className={`p-3 border rounded ${section.includes("class_") ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-200"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700 capitalize">{section.replace("_", " ")}</span>
                        <span className={`text-sm font-medium ${getSectionQualityColor(analysis.quality)}`}>
                          {analysis.present ? "✓" : "✗"} {analysis.quality}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{analysis.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Suggestions */}
            {qualityAnalysis.improvement_suggestions && qualityAnalysis.improvement_suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-700 mb-2">💡 Improvement Suggestions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {qualityAnalysis.improvement_suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className={`text-sm ${suggestion.includes("Class") ? "text-blue-700 font-medium" : "text-gray-700"}`}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatting Issues */}
            {qualityAnalysis.formatting_issues && qualityAnalysis.formatting_issues.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-orange-700 mb-2">⚠️ Formatting Issues</h4>
                <ul className="list-disc list-inside space-y-1">
                  {qualityAnalysis.formatting_issues.map((issue, index) => (
                    <li key={index} className="text-gray-700 text-sm">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {qualityAnalysis.recommendations && qualityAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-purple-700 mb-2">🎯 Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {qualityAnalysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-700 text-sm">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeAnalysis
