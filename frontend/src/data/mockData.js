// src/data/mockData.js
export const mockUser = {
  id: 1,
  username: "홍길동",
  email: "hong@example.com",
  password: "12341234",
  role: "USER",
  address: "서울특별시 강남구 테헤란로 123",
  phone: "010-1234-1234",
  createdAt: "2025-10-20"
};

export const mockProducts = [
  {
    id: 1,
    name: "Midnight Blossom",
    description: "깊은 밤의 자스민과 머스크 향이 어우러진 고급스러운 향수.",
    price: 59000,
    stock: 42,
    category: "향수",
    imageUrl: "/images/products/midnight_blossom.jpg",
    season: "WINTER",
    keyword: "머스크, 자스민, 블로섬",
    createdAt: "2025-10-01",
    isDeleted: false,
    deletedAt: null,
  },
  {
    id: 2,
    name: "Citrus Garden",
    description: "상큼한 레몬과 오렌지 향이 어우러진 상쾌한 향수.",
    price: 48000,
    stock: 87,
    category: "향수",
    imageUrl: "/images/products/citrus_garden.jpg",
    season: "SUMMER",
    keyword: "시트러스, 상큼, 레몬",
    createdAt: "2025-09-22",
    isDeleted: false,
    deletedAt: null,
  },
  {
    id: 3,
    name: "Woodland Whisper",
    description: "삼나무와 샌달우드의 부드럽고 따뜻한 우디향.",
    price: 67000,
    stock: 25,
    category: "향수",
    imageUrl: "/images/products/woodland_whisper.jpg",
    season: "AUTUMN",
    keyword: "우디, 삼나무, 샌달우드",
    createdAt: "2025-08-15",
    isDeleted: false,
    deletedAt: null,
  },
  {
    id: 4,
    name: "Spring Dew",
    description: "이슬 머금은 꽃잎과 허브의 청초한 향기.",
    price: 52000,
    stock: 60,
    category: "향수",
    imageUrl: "/images/products/spring_dew.jpg",
    season: "SPRING",
    keyword: "플로럴, 허브, 이슬",
    createdAt: "2025-07-30",
    isDeleted: false,
    deletedAt: null,
  },
];

export const mockCustomPerfumes = [
    { 
        id: 1, 
        name: "나만의 향수 #1", 
        price: 59000, 
        top: "",
        middle: "",
        last: "",
        volume: 50,
        quantity: 1 
     },
  ];

export const mockCartItems = [
    {
      "id": 1,
      "name": "라벤더 플로럴 향수",
      "price": 32000,
      "quantity": 2,
      "totalPrice": 64000,
      "imageUrl": "https://example.com/images/lavender.jpg",
      "isCustom": false
    },
    {
      "id": 2,
      "name": "시트러스 버베나 향수",
      "price": 29000,
      "quantity": 1,
      "totalPrice": 29000,
      "imageUrl": "https://example.com/images/citrus.jpg",
      "isCustom": false
    },
    {
      "id": 3,
      "name": "나만의 커스텀 향수 #Rose & Musk",
      "price": 48000,
      "quantity": 1,
      "totalPrice": 48000,
      "imageUrl": "https://example.com/images/custom_rose_musk.png",
      "isCustom": true
    },
    {
      "id": 4,
      "name": "커스텀 시트러스 우디 블렌드",
      "price": 52000,
      "quantity": 1,
      "totalPrice": 52000,
      "imageUrl": "https://example.com/images/custom_citrus_woody.png",
      "isCustom": true
    }
  ]
