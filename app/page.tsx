import { Button } from "@testComponents/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        IELTS Test Platform
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Take a Test</CardTitle>
            <CardDescription>
              Practice your IELTS skills with our test modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Choose from available test modules including Listening, Reading,
              Writing, and Speaking. Track your progress and get instant
              feedback.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/tests" className="w-full">
              <Button className="w-full">
                Start Testing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create a Test</CardTitle>
            <CardDescription>
              Design your own IELTS test modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Create custom IELTS test modules with our intuitive test builder.
              Configure sections, questions, and scoring rules.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/creator" className="w-full">
              <Button className="w-full" variant="outline">
                Open Creator <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
