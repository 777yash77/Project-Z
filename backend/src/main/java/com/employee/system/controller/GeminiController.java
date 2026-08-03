package com.employee.system.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.system.service.GeminiService;

@RestController
@RequestMapping("/api/gemini")
@CrossOrigin(origins = "*")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/insights")
    public ResponseEntity<?> generateInsights(@RequestBody Map<String, String> payload) {
        String prompt = payload.getOrDefault("prompt", "Provide executive employee retention insights for high attrition risks.");
        String result = geminiService.generateContent(prompt);

        Map<String, Object> response = new HashMap<>();
        if (result != null && !result.isBlank()) {
            response.put("source", "Google Gemini API (gemini-1.5-flash)");
            response.put("insight", result);
        } else {
            response.put("source", "HR Intelligence AI Engine (Fallback)");
            response.put("insight", "Workforce analytics indicate high risk concentrated in Engineering & Sales. Priority actions: 1) Execute stay interviews for engineers with >5 years tenure. 2) Review market compensation benchmarks against industry standard. 3) Initiate trade placement for high-performing, disengaged candidates.");
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/outreach-draft")
    public ResponseEntity<?> generateOutreachDraft(@RequestBody Map<String, String> payload) {
        String targetHr = payload.getOrDefault("targetHr", "HR Representative");
        String targetOrg = payload.getOrDefault("targetOrg", "Partner Company");
        String prompt = String.format("Write a professional, concise LinkedIn-style B2B HR outreach message to %s at %s proposing talent mobility, cross-organization recruiting, and retention risk sharing.", targetHr, targetOrg);

        String result = geminiService.generateContent(prompt);
        Map<String, Object> response = new HashMap<>();
        if (result != null && !result.isBlank()) {
            response.put("source", "Google Gemini API");
            response.put("draft", result);
        } else {
            response.put("source", "HR Intelligence AI Engine");
            response.put("draft", String.format("Hi %s! I'm reaching out from our organization to discuss potential talent mobility synergies with %s. We have open listings and would love to explore mutually beneficial recruitment opportunities. Let's connect!", targetHr, targetOrg));
        }
        return ResponseEntity.ok(response);
    }
}
