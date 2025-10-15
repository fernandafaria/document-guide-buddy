import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SignupInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    intentions: [] as string[],
  });

  const toggleIntention = (intention: string) => {
    setFormData({
      ...formData,
      intentions: formData.intentions.includes(intention)
        ? formData.intentions.filter((i) => i !== intention)
        : [...formData.intentions, intention],
    });
  };

  const handleContinue = () => {
    if (!formData.name || !formData.age || !formData.gender || formData.intentions.length === 0) {
      toast({
        title: "Preencha todos os campos",
        description: "Complete todas as informações para continuar",
        variant: "destructive",
      });
      return;
    }
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-light rounded-full mb-8">
        <div className="h-full w-1/2 bg-coral rounded-full transition-all duration-300" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black-soft mb-2">
          Basic Information
        </h1>
        <p className="text-lg text-gray-medium">Tell us about yourself</p>
      </div>

      {/* Form */}
      <div className="space-y-6 mb-8">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold text-black-soft">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-base font-semibold text-black-soft">
            Age
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Your age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
            min="18"
            max="99"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-base font-semibold text-black-soft">
            Gender
          </Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger className="h-14 bg-gray-light border-0 rounded-2xl text-base">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Feminino</SelectItem>
              <SelectItem value="non-binary">Não-binário</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Looking For */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-black-soft">
            Looking for
          </Label>
          <div className="flex gap-3">
            <Badge
              onClick={() => toggleIntention("date")}
              className={`flex-1 h-14 justify-center text-base cursor-pointer transition-all ${
                formData.intentions.includes("date")
                  ? "bg-coral text-white"
                  : "bg-gray-light text-gray-dark hover:bg-gray-medium/20"
              }`}
            >
              Date
            </Badge>
            <Badge
              onClick={() => toggleIntention("friendship")}
              className={`flex-1 h-14 justify-center text-base cursor-pointer transition-all ${
                formData.intentions.includes("friendship")
                  ? "bg-coral text-white"
                  : "bg-gray-light text-gray-dark hover:bg-gray-medium/20"
              }`}
            >
              Amizade
            </Badge>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue Button */}
      <Button className="w-full h-14" onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
};

export default SignupInfo;
