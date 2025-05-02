import React from "react";
import { AlertCircle, CheckCircle, TrendingUp, Pill } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

function DiagnosisDisplay({ diagnosis }) {
  // Changed prop name to 'diagnosis'
  const {
    diagnoses,
    shouldSeekProfessionalCare,
    advice,
    medicineRecommendations,
  } = diagnosis || {}; // Destructure the diagnosis prop

  // Removed loading and error states

  return (
    <Card className="w-full shadow-lg rounded-lg mt-8">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-cyan-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Health Insights & Suggestions
        </CardTitle>
        <CardDescription>
          Potential diagnoses and informational suggestions based on your
          symptoms. This is not a substitute for professional medical advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Potential Conditions:</h3>
          <ul className="space-y-4">
            {diagnoses?.map((diag, index) => (
              <li key={index} className="p-4 border rounded-md bg-secondary/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-foreground">
                    {diag.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Confidence: {(diag.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={diag.confidence * 100} className="h-2 " />
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Recommendation:</h3>
          <Alert
            variant={shouldSeekProfessionalCare ? "destructive" : "default"}
            className={
              shouldSeekProfessionalCare
                ? "bg-accent/10 border-accent text-accent-foreground"
                : ""
            }
          >
            {shouldSeekProfessionalCare ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4 text-primary" />
            )}
            <AlertTitle>
              {shouldSeekProfessionalCare
                ? "Seek Professional Care"
                : "Monitor Symptoms"}
            </AlertTitle>
            <AlertDescription>
              {shouldSeekProfessionalCare
                ? "It is strongly recommended to consult a healthcare professional."
                : "Your symptoms may not require immediate attention. Monitor your condition."}
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Additional Advice:
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{advice}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Pill className="h-5 w-5 text-cyan-700" />
            Potential OTC Medication Suggestions:
          </h3>
          {medicineRecommendations?.recommendations && (
            <>
              <Accordion type="single" collapsible className="w-full">
                {medicineRecommendations.recommendations.map((med, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-medium text-foreground hover:no-underline">
                      {med.medicineName}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                      {med.dosageSuggestion && (
                        <p>
                          <strong>Dosage:</strong> {med.dosageSuggestion}
                        </p>
                      )}
                      {med.precautions && (
                        <p>
                          <strong>Precautions:</strong> {med.precautions}
                        </p>
                      )}
                      {!med.dosageSuggestion && !med.precautions && (
                        <p>
                          No specific dosage or precaution info provided. Always
                          follow package instructions and consult a doctor.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {medicineRecommendations.disclaimer && (
                <Alert variant="default" className="mt-4 bg-muted/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important Disclaimer</AlertTitle>
                  <AlertDescription>
                    {medicineRecommendations.disclaimer}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          {!medicineRecommendations?.recommendations && (
            <p className="text-muted-foreground">
              No medication suggestions available.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground italic">
          Overall Disclaimer: HealthWise Assistant provides informational
          suggestions based on AI analysis and does not constitute medical
          advice. Always consult with a qualified healthcare provider for any
          health concerns or before making any decisions related to your health
          or treatment.
        </p>
      </CardFooter>
    </Card>
  );
}

export default DiagnosisDisplay;
