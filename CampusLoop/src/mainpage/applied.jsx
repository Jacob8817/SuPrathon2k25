import React, { useEffect, useState } from 'react'
import { useUserStore } from '../store'
import Sidebar from '../components/sidebar'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const applied = () => {
    const userData = useUserStore((state) => state.user)
    const [data , setData] = useState()
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`http://localhost:3000/api/application/applied/${useUserStore.getState().user.registerno}`)
            setData(response.data)
        }
        fetchData()
    }, [])
  return (
    <div className='flex h-screen'>
        <Sidebar />
        <div className='w-5/6 p-4'>
            <h1 className='text-2xl font-bold mb-4'>Applied Jobs</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {data?.map((job) => (
                    <div key={job._id} className='bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition-shadow duration-200'>
                        <h2 className='text-lg font-semibold mb-2'>{job.title}</h2>
                        <p className='text-gray-600 mb-4'>Company: {job.company_name}</p>
                        <p className='text-gray-600 mb-4'>Applied At: {new Date(job.applied_at).toLocaleDateString()}</p>
                        <p className='text-gray-600 mb-4'>Status: {job.status}</p>
                       
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default applied