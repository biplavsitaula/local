export type SeasonalTheme = 'christmas' | 'thanksgiving' | 'newyear' | 'default' | 'tihar' | 'dashain' | 'holi' | string;

export interface SeasonalThemeData {
  keyname: SeasonalTheme;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  ctaText: string;
  category?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gradient: string;
  emoji?: string;
}











































