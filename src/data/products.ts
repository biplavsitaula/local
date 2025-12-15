import { Product } from '@/types';

export const products: Product[] = [
  // Whiskey
  {
    id: 1,
    name: 'Royal Stag Premium',
    nameNe: 'रोयल स्ट्याग प्रिमियम',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=500&fit=crop',
    category: 'whiskey',
    volume: '750ml',
    alcohol: '42.8%',
    description: 'A premium Indian blended whiskey with smooth taste'
  },
  {
    id: 2,
    name: 'Johnnie Walker Black Label',
    nameNe: 'जोनी वाकर ब्ल्याक लेबल',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=500&fit=crop',
    category: 'whiskey',
    volume: '750ml',
    alcohol: '40%',
    description: 'Iconic blended Scotch whisky with smoky character'
  },
  {
    id: 3,
    name: 'Jack Daniels Tennessee',
    nameNe: 'ज्याक ड्यानियल्स टेनेसी',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1602078556972-9c4b5c72b5c6?w=400&h=500&fit=crop',
    category: 'whiskey',
    volume: '750ml',
    alcohol: '40%',
    description: 'Classic Tennessee whiskey with smooth vanilla notes'
  },
  {
    id: 4,
    name: 'Chivas Regal 12',
    nameNe: 'चिवास रिगल १२',
    price: 5200,
    image: 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=400&h=500&fit=crop',
    category: 'whiskey',
    volume: '750ml',
    alcohol: '40%',
    description: 'Rich and smooth Scotch with honey notes'
  },

  // Vodka
  {
    id: 5,
    name: 'Absolut Original',
    nameNe: 'एब्सोलुट ओरिजिनल',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1614963366795-973eb8748ade?w=400&h=500&fit=crop',
    category: 'vodka',
    volume: '750ml',
    alcohol: '40%',
    description: 'Premium Swedish vodka with pure taste'
  },
  {
    id: 6,
    name: 'Grey Goose Premium',
    nameNe: 'ग्रे गुज प्रिमियम',
    price: 4800,
    image: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400&h=500&fit=crop',
    category: 'vodka',
    volume: '750ml',
    alcohol: '40%',
    description: 'French luxury vodka with exceptional smoothness'
  },
  {
    id: 7,
    name: 'Smirnoff Red Label',
    nameNe: 'स्मिर्नोफ रेड लेबल',
    price: 1400,
    image: 'https://images.unsplash.com/photo-1598018553943-8a12d96e9650?w=400&h=500&fit=crop',
    category: 'vodka',
    volume: '750ml',
    alcohol: '37.5%',
    description: 'World\'s best-selling premium vodka'
  },

  // Rum
  {
    id: 8,
    name: 'Bacardi White Rum',
    nameNe: 'बकार्डी व्हाइट रम',
    price: 1600,
    image: 'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=400&h=500&fit=crop',
    category: 'rum',
    volume: '750ml',
    alcohol: '37.5%',
    description: 'Light and crisp white rum, perfect for cocktails'
  },
  {
    id: 9,
    name: 'Old Monk Supreme',
    nameNe: 'ओल्ड मोन्क सुप्रिम',
    price: 850,
    image: 'https://images.unsplash.com/photo-1514218953589-2d7d37efd2dc?w=400&h=500&fit=crop',
    category: 'rum',
    volume: '750ml',
    alcohol: '42.8%',
    description: 'Legendary Indian dark rum with rich flavor'
  },
  {
    id: 10,
    name: 'Captain Morgan Original',
    nameNe: 'क्याप्टेन मोर्गन ओरिजिनल',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1574210484879-3eb02022e2da?w=400&h=500&fit=crop',
    category: 'rum',
    volume: '750ml',
    alcohol: '35%',
    description: 'Spiced rum with Caribbean flavor'
  },

  // Wine
  {
    id: 11,
    name: 'Jacob\'s Creek Shiraz',
    nameNe: 'ज्याकब्स क्रीक शिराज',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=500&fit=crop',
    category: 'wine',
    volume: '750ml',
    alcohol: '13.5%',
    description: 'Australian red wine with berry flavors'
  },
  {
    id: 12,
    name: 'Sula Vineyards Red',
    nameNe: 'सुला भिनयार्ड्स रेड',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=500&fit=crop',
    category: 'wine',
    volume: '750ml',
    alcohol: '12%',
    description: 'Premium Indian red wine'
  },
  {
    id: 13,
    name: 'Yellow Tail Chardonnay',
    nameNe: 'येलो टेल चार्डोनी',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1566995541428-f2246c17cda1?w=400&h=500&fit=crop',
    category: 'wine',
    volume: '750ml',
    alcohol: '12.5%',
    description: 'Crisp Australian white wine'
  },

  // Beer
  {
    id: 14,
    name: 'Tuborg Strong',
    nameNe: 'टुबोर्ग स्ट्रंग',
    price: 350,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=500&fit=crop',
    category: 'beer',
    volume: '650ml',
    alcohol: '8%',
    description: 'Popular strong beer with bold taste'
  },
  {
    id: 15,
    name: 'Budweiser Premium',
    nameNe: 'बडवाइजर प्रिमियम',
    price: 280,
    image: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400&h=500&fit=crop',
    category: 'beer',
    volume: '500ml',
    alcohol: '5%',
    description: 'King of beers with crisp flavor'
  },
  {
    id: 16,
    name: 'Carlsberg Elephant',
    nameNe: 'कार्ल्सबर्ग एलिफेन्ट',
    price: 320,
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=500&fit=crop',
    category: 'beer',
    volume: '650ml',
    alcohol: '7.5%',
    description: 'Premium strong lager with rich taste'
  },

  // Brandy
  {
    id: 17,
    name: 'Morpheus XO',
    nameNe: 'मोर्फियस एक्सओ',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1569078449082-a79eec46a9ea?w=400&h=500&fit=crop',
    category: 'brandy',
    volume: '750ml',
    alcohol: '42.8%',
    description: 'Premium Indian brandy with smooth finish'
  },
  {
    id: 18,
    name: 'Honey Bee Classic',
    nameNe: 'हनी बी क्लासिक',
    price: 650,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=500&fit=crop',
    category: 'brandy',
    volume: '750ml',
    alcohol: '36%',
    description: 'Affordable brandy with honey notes'
  },

  // Gin
  {
    id: 19,
    name: 'Bombay Sapphire',
    nameNe: 'बम्बे स्याफायर',
    price: 2600,
    image: 'https://images.unsplash.com/photo-1631939046872-79ef3d41d1f1?w=400&h=500&fit=crop',
    category: 'gin',
    volume: '750ml',
    alcohol: '40%',
    description: 'Premium London dry gin with botanicals'
  },
  {
    id: 20,
    name: 'Tanqueray London Dry',
    nameNe: 'ट्यांकरे लण्डन ड्राई',
    price: 2400,
    image: 'https://images.unsplash.com/photo-1628089354955-3aa9f4a7f4e3?w=400&h=500&fit=crop',
    category: 'gin',
    volume: '750ml',
    alcohol: '43.1%',
    description: 'Classic London dry gin with juniper'
  },

  // Tequila
  {
    id: 21,
    name: 'Jose Cuervo Especial',
    nameNe: 'होसे कुएर्भो एस्पेसियल',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400&h=500&fit=crop',
    category: 'tequila',
    volume: '750ml',
    alcohol: '38%',
    description: 'World\'s best-selling tequila'
  },
  {
    id: 22,
    name: 'Patron Silver',
    nameNe: 'प्याट्रन सिल्भर',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400&h=500&fit=crop',
    category: 'tequila',
    volume: '750ml',
    alcohol: '40%',
    description: 'Ultra premium 100% agave tequila'
  },
];

export const categories = [
  { id: 'whiskey', name: 'Whiskey', nameNe: 'व्हिस्की', icon: '🥃' },
  { id: 'vodka', name: 'Vodka', nameNe: 'भोड्का', icon: '🍸' },
  { id: 'rum', name: 'Rum', nameNe: 'रम', icon: '🍹' },
  { id: 'wine', name: 'Wine', nameNe: 'वाइन', icon: '🍷' },
  { id: 'beer', name: 'Beer', nameNe: 'बियर', icon: '🍺' },
  { id: 'brandy', name: 'Brandy', nameNe: 'ब्रान्डी', icon: '🥂' },
  { id: 'gin', name: 'Gin', nameNe: 'जिन', icon: '🍸' },
  { id: 'tequila', name: 'Tequila', nameNe: 'टकीला', icon: '🌵' },
];
