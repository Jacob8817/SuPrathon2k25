import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../store"

const Login = () => {
  const [password, setPassword] = useState("")
  const [registerNo, setRegisterNo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)

  const handleLogin = async () => {
    setIsLoading(true)

    try {
      const loginRes = await axios.post("http://localhost:3000/api/loginUser", {
        registerno: registerNo,
        password,
      })

      const user = loginRes.data.user
      const studentId = user?.userid

      if (!studentId) throw new Error("Student ID not found in login response")

      let detailRes = { data: {} }

      try {
        detailRes = await axios.get(
          `http://localhost:3000/api/extractor/fetch?studentid=${studentId}`
        )
      } catch (err) {
        console.warn("No additional data found for student. Continuing without it.")
      }

      const mergedUserData = {
        ...user,
        ...detailRes.data,
      }

      setUser(mergedUserData)
      navigate("/dashboard")
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "Login failed"
      alert(errMsg)
      console.error("Error logging in:", errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to CampusLoop</h1>
          <p className="text-lg text-gray-600">Your campus placements network</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="registerNo" className="block text-sm font-medium text-gray-700 mb-2">
                Register Number
              </label>
              <input
                id="registerNo"
                type="text"
                placeholder="Enter your register number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !registerNo || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
