import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { BASE_URL } from '@/src/constants/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from "react";
import { Redirect } from 'expo-router';
import { AppText } from "@/components/AppText";

async function fetchUser() {

    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    if (!token) {
        throw new Error("No idToken found")
    }

    const response = await fetch(`${BASE_URL}/FetchUserData`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    })
    if (!response.ok) {
        throw new Error("Failed to fetch user data")
    }
    return response.json()
}

export default function Index() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [role, setRole] = useState<"Student" | "Teacher" | "Admin"| null>(null);

    useEffect(() => {
        async function loadUser() {
            try {
                console.log("inner call?")
                const user = await fetchUser()
                setRole(user.Roles[0])
            }
            catch (e) {
                setError(true)
                console.error("Failed to get user data", e)
            }
            finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    if (loading) {
        return (
            <LoadingScreen />
        )
    }

    if (error) {
        return (
            <AppText>Error. Can't fetch data</AppText>
        )
    }

    console.log("Outer call?")
    if (role === "Student") {
        return <Redirect href="/(student)/(tabs)" />
    }
    if (role === "Teacher") {
        return <Redirect href="/(instructor)/(tabs)" />
    }
    if (role === "Admin") {
        return <Redirect href="/(admin)/(tabs)" />
    }

    
    return null
}