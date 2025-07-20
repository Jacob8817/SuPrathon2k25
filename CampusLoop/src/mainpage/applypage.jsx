"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/sidebar"
import { useUserStore } from "../store"

const ApplyPage = () => {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const userData = useUserStore((state) => state.user)
  const [company, setCompany] = useState(null)
  const [ineligibleReasons, setIneligibleReasons] = useState([])

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/company/companies/${companyId}`)
        setCompany(response.data)

        const reasons = []
        if (Number.parseFloat(userData.cgpa) < Number.parseFloat(response.data.min_cgpa)) {
          reasons.push(`CGPA is below required minimum (${response.data.min_cgpa})`)
        }
        if (Number.parseFloat(userData.class10percent) < Number.parseFloat(response.data.min_class10_percent)) {
          reasons.push(`Class 10 percentage is below required minimum (${response.data.min_class10_percent}%)`)
        }
        if (Number.parseFloat(userData.class12percent) < Number.parseFloat(response.data.min_class12_percent)) {
          reasons.push(`Class 12 percentage is below required minimum (${response.data.min_class12_percent}%)`)
        }
        if (Number.parseInt(userData.backlogs) > response.data.max_allowed_backlogs) {
          reasons.push(`Backlogs exceed the allowed maximum (${response.data.max_allowed_backlogs})`)
        }
        if (!response.data.department.includes(userData.department)) {
          reasons.push(`Only for departments: ${response.data.department.join(", ")}`)
        }

        setIneligibleReasons(reasons)
      } catch (error) {
        console.error("Error fetching company details:", error)
      }
    }

    fetchCompanyDetails()
  }, [companyId, userData])

  const handleApply = async () => {
  try {
    const payload = {
      register_no: userData.registerno,
      company_id: company.company_id,
      ineligible_reasons: ineligibleReasons,
      status: ineligibleReasons.length === 0 ? 'Applied' : 'Ineligible'
    }

    const response = await axios.post("http://localhost:3000/api/application/apply", payload)

    alert("✅ Application submitted successfully!")
    navigate("/dashboard") 
  } catch (error) {
    if (error.response && error.response.status === 409) {
      alert("⚠️ You have already applied to this company.")
    } else {
      alert("❌ Failed to submit application. Please try again later.")
      console.error("Application Error:", error)
    }
  }
}


  if (!company) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading company details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-scroll p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6 mb-8">

<div className="md:col-span-2 lg:col-span-4 xl:col-span-4 bg-white rounded-3xl shadow-xl p-6 lg:p-10 flex flex-col justify-center items-center text-center min-h-[350px] lg:min-h-[420px]">
  <div className="relative mb-6">
    <img
      src={company.company_image || "/placeholder.svg"}
      alt={`${company.company_name} Logo`}
      className="h-auto w-full max-w-3xl lg:max-w-5xl rounded-3xl object-contain shadow-2xl"
    />
  </div>
  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{company.company_name}</h1>
  <p className="text-lg text-gray-600 mb-4">{company.industry}</p>
  <div className="flex flex-wrap gap-2 justify-center">
    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
      {company.job_role}
    </span>
    <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
      {company.offer_type}
    </span>
  </div>
</div>


            {/* Package Card - Large */}
            <BentoCard
              title="Package Offered"
              value={`₹${company.package_offered}`}
              className="md:col-span-1 lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white min-h-[140px] lg:min-h-[180px]"
              large
            />

            {/* Deadline Card - Urgent */}
            <BentoCard
              title="Application Deadline"
              value={new Date(company.application_deadline).toLocaleDateString()}
              className="lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-red-500 to-pink-600 text-white min-h-[140px]"
              large
            />

            {/* CGPA Requirement */}
            <BentoCard
              title="Min CGPA Required"
              value={company.min_cgpa}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            />

            {/* Location */}
            <BentoCard
              title="Job Location"
              value={company.location}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
            />

            {/* Interview Mode */}
            <BentoCard
              title="Interview Mode"
              value={company.mode_of_interview}
              className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-amber-600 text-white"
            />

            {/* Academic Requirements Row */}
            <BentoCard
              title="Class 10th %"
              value={`${company.min_class10_percent}%`}
              className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
            />

            <BentoCard
              title="Class 12th %"
              value={`${company.min_class12_percent}%`}
              className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
            />

            <BentoCard
              title="Max Backlogs"
              value={company.max_allowed_backlogs}
              className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
            />

            <BentoCard
              title="Batch Year"
              value={company.batch_year}
              className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
            />

        
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl p-4 lg:p-6 hover:scale-105 transition-all duration-200 hover:shadow-lg">
              <h4 className="text-sm font-medium mb-2 text-white/80">Contact Person</h4>
              <p className="text-lg lg:text-xl font-bold text-white mb-1">{company.contact_person_name}</p>
              <p className="text-white/90 text-sm lg:text-base">{company.contact_email}</p>
            </div>
          </div>

   
         <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              Contact Information
            </h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-gray-700">
                <span className="font-semibold">{company.contact_person_name}</span>
              </p>
              <p className="text-blue-600 hover:text-blue-800 transition-colors">{company.contact_email}</p>
            </div>
          </div> 

          {/* Description Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <DescriptionCard title="Job Description" content={company.job_description} icon="💼" />
            <DescriptionCard title="Eligibility Criteria" content={company.eligibility_criteria} icon="📋" />
          </div>

          {/* Application Section */}
          <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
            {ineligibleReasons.length === 0 ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">You're Eligible!</h3>
                  <p className="text-gray-600">You meet all the requirements for this position.</p>
                </div>
                <button
                  onClick={handleApply}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Apply Now
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-2xl font-bold text-red-700 mb-4">Not Eligible</h3>
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-left max-w-2xl mx-auto">
                    <p className="font-semibold text-red-800 mb-3">Reasons for ineligibility:</p>
                    <ul className="space-y-2">
                      {ineligibleReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-red-700">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const BentoCard = ({ title, value, className = "", large = false }) => (
  <div
    className={`
    rounded-2xl p-4 lg:p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg
    ${large ? "min-h-[120px] lg:min-h-[140px]" : "min-h-[100px] lg:min-h-[120px]"}
    ${className}
  `}
  >
    <h4 className={`text-sm font-medium mb-2 ${className.includes("text-white") ? "text-white/80" : "text-gray-500"}`}>
      {title}
    </h4>
    <p
      className={`font-bold ${large ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl"} ${className.includes("text-white") ? "text-white" : "text-gray-900"}`}
    >
      {value}
    </p>
  </div>
)

const DescriptionCard = ({ title, content, icon }) => (
  <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition-shadow duration-200">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
    <div className="bg-gray-50 rounded-2xl p-4 lg:p-6">
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  </div>
)

export default ApplyPage
