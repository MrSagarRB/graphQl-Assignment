import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";

export default function App() {
  const [email, setEmail] = useState("superadmin@example.com");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const endpoint = "http://172.232.70.228:8080/api/gql/query";

  const generateOtpMutation = `
  mutation {
    generateOTP(input: {
      email: "superadmin@example.com"
    })
  }
  `;

  const loginMutation = `
  mutation Login($email: NullString, $otp: NullString) {
    login(input: {
      email: $email,
      otp: $otp
    }) {
      id
      name
      isAdmin
      orgUID
      roleID
      sessionToken
    }
  }
`;

  const getUserQuery = `
query {
  users(
    search: { query: "" }
    roleID: "<roleID>"
  ) {
    totalCount
    nodes {
      id
      name
      email
      role {
        id
        name
      }
    }
  }
}
`;

  const handleOtpRequest = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: generateOtpMutation,
        variables: { email },
      }),
    });
    const data = await response.json();
    if (data.errors) {
      console.error(data.errors);
      // Handle errors
    } else {
      const otp = data.data.generateOTP; // Extract the OTP value from the response data
      setEmail(email);
      setOtpSent(true);
      setOtp(otp); // Set the OTP state to the generated OTP value
    }
  };
  const handleLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: loginMutation,
        variables: { email, otp },
      }),
    });
    const data = await response.json();
    if (data.errors) {
      console.error(data.errors);
      // Handle errors
    } else if (data.data.login) {
      const { sessionToken } = data.data.login;
      Cookies.set("sessionToken", sessionToken);
      setLoggedIn(true);
    }
  };
  const sessionToken = Cookies.get("sessionToken");

  useMemo(() => {
    console.log(sessionToken);
  }, [sessionToken]);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      {!otpSent && !loggedIn && (
        <form className="w-96" onSubmit={handleOtpRequest}>
          <h2 className="text-xl font-bold mb-4">Request OTP</h2>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="border rounded py-2 px-3 mb-4 w-full"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Request OTP
          </button>
        </form>
      )}
      {otpSent && !loggedIn && (
        <form className="w-96" onSubmit={handleLogin}>
          <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
          <label className="block mb-2">OTP</label>
          <input
            type="text"
            placeholder="Enter OTP"
            className="border rounded py-2 px-3 mb-4 w-full"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Log In
          </button>
        </form>
      )}
      {loggedIn && (
        <div className="w-96 text-center">
          <h2 className="text-xl font-bold mb-4">You are logged in!</h2>
          <p className="mb-4">Email: {email}</p>
          <p className="mb-4">OTP: {otp}</p>
        </div>
      )}
    </div>
  );
}
