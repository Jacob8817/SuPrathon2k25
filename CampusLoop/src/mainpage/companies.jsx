import React, { useEffect, useState } from 'react'
import { useUserStore } from '../store'
import Sidebar from '../components/sidebar'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Companies = () => {
  const userData = useUserStore((state) => state.user)
  const [companies, setCompanies] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/company/companies`)
        setCompanies(response.data)
      } catch (error) {
        console.error("Error fetching companies:", error)
      }
    }

    fetchCompanies()
  }, [])

  const evaluateEligibility = (company, user) => {
    if (!user) return { eligible: false, reasons: ['User not logged in'] }

    const reasons = []

    if (parseFloat(user.cgpa || '0') < parseFloat(company.min_cgpa)) {
      reasons.push(`CGPA < ${company.min_cgpa}`)
    }

    if (parseFloat(user.class10percentage || '0') < parseFloat(company.min_class10_percent)) {
      reasons.push(`10th % < ${company.min_class10_percent}`)
    }

    if (parseFloat(user.class12percentage || '0') < parseFloat(company.min_class12_percent)) {
      reasons.push(`12th % < ${company.min_class12_percent}`)
    }

    if (parseInt(user.backlog || '0') > company.max_allowed_backlogs) {
      reasons.push(`Backlogs > ${company.max_allowed_backlogs}`)
    }

    if (!company.department.includes(user.department)) {
      reasons.push(`Department not eligible`)
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    }
  }

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='w-5/6 p-6 bg-gray-100 overflow-y-auto'>
        <h1 className='text-3xl font-bold mb-2'>Eligible Companies</h1>
        <p className='text-gray-700 mb-6'>Companies based on your academic profile</p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {companies.map((company) => {
            const { eligible, reasons } = evaluateEligibility(company, userData)

            return (
              <div
                key={company.company_id}
                className={`p-5 rounded-xl shadow transition ${
                  eligible ? 'bg-white hover:shadow-lg' : 'bg-gray-200 opacity-70 cursor-not-allowed'
                }`}
              >
                <img
                  src={company.company_image}
                  alt={`${company.company_name} logo`}
                  className='h-12 mb-4 object-contain'
                />
                <h2 className='text-xl font-semibold'>{company.company_name}</h2>
                <p className='text-gray-600 mb-1'><strong>Role:</strong> {company.job_role}</p>
                <p className='text-gray-600 mb-1'><strong>Location:</strong> {company.location}</p>
                <p className='text-gray-600 mb-3'><strong>CTC:</strong> ₹{Number(company.package_offered).toLocaleString()}</p>
                
                <button
                  disabled={!eligible}
                  onClick={() => eligible && navigate(`/company/${company.company_id}`)}
                  className={`mt-2 px-4 py-2 rounded w-full ${
                    eligible
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  {eligible ? 'View Details' : 'Not Eligible'}
                </button>

                {!eligible && (
                  <ul className='text-sm text-red-600 mt-3 list-disc list-inside'>
                    {reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Companies
