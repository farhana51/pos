"use client"

import { useState, useTransition } from "react"
import { Lightbulb } from "lucide-react"

import type { OrderItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUpsellRecommendationAction } from "@/app/actions"
import { Skeleton } from "../ui/skeleton"

interface UpsellRecommenderProps {
  items: OrderItem[]
}

export function UpsellRecommender({ items }: UpsellRecommenderProps) {
  const [isPending, startTransition] = useTransition()
  const [recommendation, setRecommendation] = useState<{
    text: string
    reason: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGetRecommendation = () => {
    startTransition(async () => {
      setError(null)
      setRecommendation(null)
      const itemsOrdered = items.map(item => item.menuItem.name);
      const result = await getUpsellRecommendationAction({ itemsOrdered });
      
      if (result.shouldSuggest) {
        setRecommendation({ text: result.recommendation, reason: result.reason });
      } else {
        setError(result.reason || "No suggestion available at this time.");
      }
    })
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-headline">
          <Lightbulb className="h-5 w-5 text-accent" />
          AI Upsell Assistant
        </CardTitle>
        <CardDescription>
          Get an AI-powered recommendation based on the current order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGetRecommendation} disabled={isPending} className="w-full mb-4">
          {isPending ? "Analyzing..." : "Get Suggestion"}
        </Button>
        {isPending && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {recommendation && (
          <div className="space-y-1 rounded-md border border-primary/10 bg-background p-3">
            <p className="font-semibold text-primary">{recommendation.text}</p>
            <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
