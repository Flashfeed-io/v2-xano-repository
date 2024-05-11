const genre = [
  {
    id: "recUwlOLieavOnhx9",
    prompt: "Voiceover: A video where the entire ad is narrated by someone.",
  },
  {
    id: "recwG47UUEjtJYWkX",
    prompt:
      "Story / Skit: A video where characters talk and interact through a story.",
  },
  {
    id: "recOMHeS0Z0EChZW3",
    prompt:
      "Talking Head Video: A video where a single person, or multiple people, talk to the camera, with options for alternative B-Roll shots.",
  },
  {
    id: "recaQfNcuczafnjS2",
    prompt:
      "Visual Reel: A video that has no narration, and is entirely audiovisual.",
  },
];

const ad_purpose = [
  {
    id: "recSL0G465hfpRlAp",
    prompt: "The video advertisement's purpose is conversion-focused.",
  },
  {
    id: "recIPzH0T1hBToyNd",
    prompt: "The video advertisement's purpose is branding-focused.",
  },
];

export function findGenrePromptById(promptId) {
  const foundPrompt = genre.find((item) => item.id === promptId);
  return foundPrompt ? foundPrompt.prompt : null;
}

export function findAdPurposePromptById(promptId) {
  const foundPrompt = ad_purpose.find((item) => item.id === promptId);
  return foundPrompt ? foundPrompt.prompt : null;
}
