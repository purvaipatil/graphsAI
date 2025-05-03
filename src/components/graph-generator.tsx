"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

declare global {
  interface Window {
    Desmos: any
  }
}

export default function GraphGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [equations, setEquations] = useState<string[]>([])
  const calculatorRef = useRef<HTMLDivElement>(null)
  const calculatorInstance = useRef<any>(null)

  // Initialize Desmos calculator
  useEffect(() => {
    // Load Desmos script dynamically
    const script = document.createElement("script")
    script.src = "https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
    script.async = true
    script.onload = () => {
      if (calculatorRef.current && window.Desmos) {
        calculatorInstance.current = window.Desmos.GraphingCalculator(calculatorRef.current)
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Update calculator when equations change
  useEffect(() => {
    if (calculatorInstance.current && equations.length > 0) {
      calculatorInstance.current.removeExpressions(calculatorInstance.current.getExpressions())

      equations.forEach((equation, index) => {
        try {
          calculatorInstance.current.setExpression({
            id: `equation-${index}`,
            latex: equation.trim(),
            color: getRandomColor(),
          })
        } catch (error) {
          console.error(`Error rendering equation: ${equation}`, error)
        }
      })
    }
  }, [equations])

  const getRandomColor = () => {
    const colors = [
      "#2d70b3", // blue
      "#388c46", // green
      "#6042a6", // purple
      "#b56e0a", // orange
      "#c74440", // red
      "#000000", // black
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleGenerateGraphs = async () => {
    if (!prompt.trim()) {
      toast.error("Empty prompt", {
        description: "Please enter a prompt to generate equations.",
      })
      return
    }

    setIsLoading(true)
    setEquations([])

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate equations")
      }

      const data = await response.json()

      if (data.equations && data.equations.length > 0) {
        setEquations(data.equations)
        toast.success("Graphs generated", {
          description: `Generated ${data.equations.length} equation${data.equations.length > 1 ? "s" : ""}`,
        })
      } else {
        toast.error("No equations generated", {
          description:
            "Try a different prompt or be more specific about the mathematical functions you want to visualize.",
        })
      }
    } catch (error) {
      console.error("Error generating equations:", error)
      toast.error("Error", {
        description: "Failed to generate equations. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-transparent">
      {/* Left side - Input and Equations */}
      <div className="space-y-6 ">
        <Card className="p-6 ">
          <div className="space-y-4 ">
            <Textarea
              placeholder="Describe the mathematical functions you want to visualize (e.g., 'Plot a sine wave, a parabola, and a straight line')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            <div className="flex items-center justify-center">
              <Button onClick={handleGenerateGraphs} className="w-40" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Graphs"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {equations.length > 0 && (
          <Card className="p-4 ">
            <h3 className="font-medium mb-3 text-lg">Generated Equations:</h3>
            <ul className="space-y-2">
              {equations.map((eq, index) => (
                <li key={index} className="p-2 bg-muted rounded-md font-mono text-sm break-words">
                  {eq}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Right side - Desmos Graph */}
      {/* <Card className="p-4 h-[500px] lg:h-[calc(100vh-200px)] min-h-[500px]"> */}
      <Card className="p-4 h-[500px] lg:h-[calc(100vh-200px)] h-screen ">
        <div ref={calculatorRef} className="w-full h-full" />
      </Card>
    </div>
  )
}

