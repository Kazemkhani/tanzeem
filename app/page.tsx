import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-rta-primary rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <CardTitle className="text-2xl">TANZEEM</CardTitle>
          <CardDescription>RTA Smart School Pickup System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/parent" className="block">
            <Button className="w-full" size="xl">
              Parent App
            </Button>
          </Link>
          <Link href="/ops" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Operations Dashboard
            </Button>
          </Link>
          <p className="text-xs text-center text-gray-500 mt-6">
            Prototype Demo — RTA Pitch
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
