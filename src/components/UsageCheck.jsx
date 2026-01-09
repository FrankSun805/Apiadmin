import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Calendar, Activity } from "lucide-react"

function UsageCheck({ token }) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const checkUsage = async () => {
        if (!token) {
            setError('Please enter a token above')
            return
        }
        setLoading(true)
        setError('')
        setResult(null)

        try {
            // Use the proxy path /api/license/usage (proxy strips /api)
            const res = await fetch(`/api/license/usage?token=${encodeURIComponent(token)}`)
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`)
            }
            const data = await res.json()

            if (data.code === 200) {
                setResult(data.data)
            } else {
                setError(data.msg || 'Unknown error')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-5xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">License Usage</CardTitle>
                    <CardDescription>Check your current plan limits and usage statistics.</CardDescription>
                </div>
                <Button onClick={checkUsage} disabled={loading} size="lg">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Checking...' : 'Check Balance'}
                </Button>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-4 mb-6 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                        Error: {error}
                    </div>
                )}

                {result && (
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                                <Activity className="h-8 w-8 text-primary mb-2" />
                                <div className="text-sm font-medium text-muted-foreground">Total Limit</div>
                                <div className="text-3xl font-bold">{result.maxTimes}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                                <CreditCard className="h-8 w-8 text-blue-500 mb-2" />
                                <div className="text-sm font-medium text-muted-foreground">Used</div>
                                <div className="text-3xl font-bold text-blue-500">{result.usedTimes}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                                <Calendar className="h-8 w-8 text-orange-500 mb-2" />
                                <div className="text-sm font-medium text-muted-foreground">Expires At</div>
                                <div className="text-xl font-bold mt-1 text-orange-500">{result.expireTime}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!result && !error && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Activity className="h-10 w-10 mb-4 opacity-50" />
                        <p>Enter your token and click "Check Balance" to see usage details.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default UsageCheck
