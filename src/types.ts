export type AssetType = 'image' | 'video' | 'lottie';

export interface ProfileData {
  image: string;
  traits: string;
  aboutMeHtml: string;
  technologies: string[];
}

export interface PortfolioSection {
  title: string;
}

export interface ProjectAsset {
  url: string;
  type: AssetType;
  alt?: string;
}

export interface ProjectData {
  projectTitle: string;
  sections: string[];
  link: string;
  github?: string;
  assets: ProjectAsset[];
  summary?: string;
  year?: string;
}

export interface PortfolioData {
  profile: ProfileData;
  sections: PortfolioSection[];
  projects: ProjectData[];
  gallery?: GalleryItem[];
}


export interface ProfileData {
  image: string;
  images?: string[];
  traits: string;
  aboutMeHtml: string;
  technologies: string[];
}

export interface GalleryItem {
  url: string;
  type: 'image' | 'video';
  alt?: string;
  title?: string;
  caption?: string;
}

export type ViewerMode = 'book' | 'deck' | 'orbit' | 'cinema';
