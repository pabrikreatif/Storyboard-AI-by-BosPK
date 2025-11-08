export interface CreativeOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface StoryboardScene {
  scene: number;
  description: string;
  voiceOver: string;
  backsound: string;
  image: string; // base64 image data URL
}