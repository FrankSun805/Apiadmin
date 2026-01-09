import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Play, Image as ImageIcon, Terminal, UploadCloud } from "lucide-react"

function ImageGenTest({ token }) {
    const [loading, setLoading] = useState(false)
    const [logs, setLogs] = useState([])
    const [metrics, setMetrics] = useState({ latency: 0, total: 0 })
    const [images, setImages] = useState([])
    const timerRef = useRef(null)

    useEffect(() => {
        if (loading) {
            const start = performance.now()
            timerRef.current = setInterval(() => {
                setMetrics(m => ({ ...m, total: Math.round(performance.now() - start) }))
            }, 100)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [loading])

    // Config state
    const [apiPath, setApiPath] = useState('/v3/images/generations')
    const [prompt, setPrompt] = useState('An adorable kitten, 4k, realistic')

    // New specific params
    const [model, setModel] = useState('nanobananapro')
    const [ratio, setRatio] = useState('16:9')
    const [resolution, setResolution] = useState('4k')
    const [selectedFile, setSelectedFile] = useState(null)

    const log = (msg, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, { time: timestamp, msg, type }])
    }

    const runTest = async () => {
        if (!token) return log('Error: No token provided', 'error')

        setLoading(true)
        setLogs([]) // Clear logs
        setImages([])
        setMetrics({ latency: 0, total: 0 })

        const startTime = performance.now()
        log(`Starting test...`, 'info')
        log(`Target: /api${apiPath}`, 'info')

        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'TenantId': '000000'
            }

            const validRatio = ['16:9', '4:3', '1:1', '9:16'].includes(ratio) ? ratio : '16:9'
            const validRes = ['4k', '2k', '1080p'].includes(resolution) ? resolution : '4k'

            let body;

            if (selectedFile) {
                log('Mode: Multipart (Image Upload)', 'info')
                const formData = new FormData()
                formData.append('model', model)
                formData.append('prompt', prompt)
                formData.append('ratio', validRatio)
                formData.append('resolution', validRes)
                formData.append('images', selectedFile)

                body = formData

                const logObj = {}
                formData.forEach((value, key) => {
                    if (value instanceof File) logObj[key] = `[File: ${value.name}]`
                    else logObj[key] = value
                })
                log(`Params: ${JSON.stringify(logObj)}`, 'cmd')
            } else {
                log('Mode: JSON (Text-to-Image)', 'info')
                headers['Content-Type'] = 'application/json'

                const payload = {
                    model,
                    prompt,
                    ratio: validRatio,
                    resolution: validRes
                }

                body = JSON.stringify(payload)
                log(`Params: ${JSON.stringify(payload)}`, 'cmd')
            }

            const fetchStart = performance.now()
            const res = await fetch(`/api${apiPath}`, {
                method: 'POST',
                headers,
                body
            })

            const latency = performance.now() - fetchStart
            setMetrics(m => ({ ...m, latency: Math.round(latency) }))
            log(`Headers received in ${Math.round(latency)}ms. Status: ${res.status}`, res.ok ? 'success' : 'error')

            if (!res.ok) {
                const errText = await res.text()
                throw new Error(`API Error ${res.status}: ${errText}`)
            }

            const data = await res.json()
            log(`Body received. Size: ${JSON.stringify(data).length} bytes`, 'info')
            log(`Response: ${JSON.stringify(data, null, 2)}`, 'code')

            let foundImages = []
            if (data.data && data.data.data && Array.isArray(data.data.data)) {
                foundImages = data.data.data.map(item => item.url || item)
            } else if (data.data && Array.isArray(data.data)) {
                foundImages = data.data.map(item => item.url || item)
            } else if (Array.isArray(data)) {
                foundImages = data
            } else if (data.url) {
                foundImages = [data.url]
            }

            if (foundImages.length > 0) {
                log(`Found ${foundImages.length} images.`, 'success')
                setImages(foundImages.map((src, i) => ({ id: i, src })))
            } else {
                log('No image URLs found in response. Check structured logs.', 'warn')
            }

        } catch (e) {
            log(`Failed: ${e.message}`, 'error')
        } finally {
            if (timerRef.current) clearInterval(timerRef.current)
            const totalTime = performance.now() - startTime
            setMetrics(m => ({ ...m, total: Math.round(totalTime) }))
            setLoading(false)
            log(`Test completed in ${Math.round(totalTime)}ms`, 'info')
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
            <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="w-5 h-5" /> Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">API Path</label>
                                <Input
                                    value={apiPath}
                                    onChange={e => setApiPath(e.target.value)}
                                    placeholder="/v3/images/generations"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Model</label>
                                <Input
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    placeholder="nanobananapro"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ratio</label>
                                <Select value={ratio} onValueChange={setRatio}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ratio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="16:9">16:9</SelectItem>
                                        <SelectItem value="4:3">4:3</SelectItem>
                                        <SelectItem value="1:1">1:1</SelectItem>
                                        <SelectItem value="9:16">9:16</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Resolution</label>
                                <Select value={resolution} onValueChange={setResolution}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Res" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4k">4k</SelectItem>
                                        <SelectItem value="2k">2k</SelectItem>
                                        <SelectItem value="1080p">1080p</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image Upload</label>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setSelectedFile(e.target.files[0])}
                                        className="cursor-pointer file:text-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prompt</label>
                            <Textarea
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="Enter your prompt here..."
                                rows={3}
                            />
                        </div>

                        <Button className="w-full" onClick={runTest} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" /> Run Test
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground uppercase">Latency</div>
                                <div className="text-lg font-bold">{metrics.latency}ms</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground uppercase">Total Time</div>
                                <div className="text-lg font-bold">{metrics.total}ms</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground uppercase">Status</div>
                                <div className={`text-lg font-bold ${loading ? 'text-yellow-500 animate-pulse' : 'text-green-500'}`}>
                                    {loading ? 'Running' : 'Idle'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto pb-4" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                <Card className="flex-1 flex flex-col min-h-[300px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" /> Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            {images.length === 0 && (
                                <div className="col-span-2 h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                                    <p>Generated images will appear here</p>
                                </div>
                            )}
                            {images.map((img) => (
                                <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-background shadow-sm">
                                    <img src={img.src} alt="Generated" className="w-full h-auto object-cover transition-transform group-hover:scale-105" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 flex flex-col min-h-[200px]">
                    <CardHeader className="py-3 bg-muted/30">
                        <CardTitle className="text-xs font-mono">Console Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <div className="h-full overflow-y-auto p-4 font-mono text-xs space-y-1 bg-black text-green-400">
                            {logs.map((l, i) => (
                                <div key={i} className={`break-all ${l.type === 'error' ? 'text-red-400' : l.type === 'cmd' ? 'text-blue-400' : ''}`}>
                                    <span className="opacity-50 mr-2">[{l.time}]</span>
                                    {l.type === 'code' ? (
                                        <pre className="whitespace-pre-wrap ml-4 text-gray-300">{l.msg}</pre>
                                    ) : (
                                        <span>{l.msg}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ImageGenTest
