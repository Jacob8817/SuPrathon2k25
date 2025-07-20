"use client"

import { useEffect, useState } from "react"
import { useUserStore } from "../store"
import Sidebar from "../components/sidebar"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const Profile = () => {
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    username: "",
    registerno: "",
    email: "",
    imageurl: "",
    section: "",
    currentdegree: "",
    yearofstudy: "",
    dob: "",
    department: "",
    remarks: [],
    interests: [],
    incollege: false,
    backlog: 0,
  })

  const [newRemark, setNewRemark] = useState("")
  const [newInterest, setNewInterest] = useState("")

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    // Initialize form data with user data
    setFormData({
      username: user.username || "",
      registerno: user.registerno || "",
      email: user.email || "",
      imageurl: user.imageurl || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
      section: user.section || "",
      currentdegree: user.currentdegree || "",
      yearofstudy: user.yearofstudy || "",
      dob: user.dob ? user.dob.split("T")[0] : "", 
      department: user.department || "",
      remarks: user.remarks || [],
      interests: user.interests || [],
      incollege: user.incollege || false,
      backlog: user.backlog || 0,
    })
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addRemark = () => {
    if (newRemark.trim()) {
      setFormData((prev) => ({
        ...prev,
        remarks: [...prev.remarks, newRemark.trim()],
      }))
      setNewRemark("")
    }
  }

  const removeRemark = (index) => {
    setFormData((prev) => ({
      ...prev,
      remarks: prev.remarks.filter((_, i) => i !== index),
    }))
  }

  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (index) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await axios.put(`/api/users/${user.userid}`, formData)
      setUser(response.data)
      setMessage("Profile updated successfully!")
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-scroll max-h-screen p-8">
        <div className="max-w-4xl mx-auto">
     
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={formData.imageurl || "/placeholder.svg"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{formData.username}</h1>
                  <p className="text-gray-600">{formData.registerno}</p>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
              </div>
             
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>
          )}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Register Number</label>
                  <input
                    type="text"
                    name="registerno"
                    value={formData.registerno}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                  <input
                    type="url"
                    name="imageurl"
                    value={formData.imageurl}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Degree</label>
                  <input
                    type="text"
                    name="currentdegree"
                    value={formData.currentdegree}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                  <input
                    type="number"
                    name="yearofstudy"
                    value={formData.yearofstudy}
                    onChange={handleInputChange}
                    disabled={!editing}
                    min="1"
                    max="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Backlog Count</label>
                  <input
                    type="number"
                    name="backlog"
                    value={formData.backlog}
                    onChange={handleInputChange}
                    disabled={!editing}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="incollege"
                    checked={formData.incollege}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Currently in College</label>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Remarks</h2>
              {editing && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="Add a remark"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addRemark}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="space-y-2">
                {formData.remarks.map((remark, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span>{remark}</span>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeRemark(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {formData.remarks.length === 0 && <p className="text-gray-500 italic">No remarks added</p>}
              </div>
            </div>

         

            {/* Save Button */}
            {editing && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
