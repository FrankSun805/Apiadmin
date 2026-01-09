import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"

export default function ChatUsage({ token }) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    const fetchUsage = async () => {
        if (!token) return
        setLoading(true)
        setError(null)
        setData(null)

        try {
            const headers = { 'Authorization': `Bearer ${token}` }

            // Fetch Subscription (Quota)
            const subRes = await fetch('/openai-api/dashboard/billing/subscription', { headers })
            if (!subRes.ok) {
                console.error('Sub API Error:', subRes.status, await subRes.clone().text())
                throw new Error(`Subscription API Error (${subRes.status}): ${subRes.statusText}`)
            }
            const subData = await subRes.json()

            // Fetch Usage (99 days range to cover recent)
            const now = new Date()
            const startDate = new Date(now.setDate(now.getDate() - 99)).toISOString().split('T')[0]
            const endDate = new Date().toISOString().split('T')[0]

            const usageRes = await fetch(`/openai-api/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`, { headers })
            if (!usageRes.ok) {
                console.error('Usage API Error:', usageRes.status, await usageRes.clone().text())
                throw new Error(`Usage API Error (${usageRes.status}): ${usageRes.statusText}`)
            }
            const usageData = await usageRes.json()

            setData({
                sub: subData,
                usage: usageData
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Auto-fetch when token changes
    useEffect(() => {
        if (token) fetchUsage()
    }, [token])

    const total = data?.sub?.hard_limit_usd || 0
    const used = (data?.usage?.total_usage || 0) / 100 // Convert cents to USD
    const remaining = Math.max(0, total - used)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Chat API Usage</h2>
                <Button onClick={fetchUsage} disabled={loading} variant="outline">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {data && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Quota</CardTitle>
                            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">Hard Limit</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Used</CardTitle>
                            <span className="text-2xl font-bold text-blue-600">${used.toFixed(2)}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                {((used / total) * 100).toFixed(1)}% of quota
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                            <span className="text-2xl font-bold text-green-600">${remaining.toFixed(2)}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">Available balance</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Progress Bar Visualization */}
            {data && (
                <Card className="p-6">
                    <h3 className="mb-4 text-sm font-medium">Usage Overview</h3>
                    <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${Math.min(((used / total) * 100), 100)}%` }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>$0.00</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </Card>
            )}
        </div>
    )
}
