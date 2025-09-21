const adjectives = [
  "빠른",
  "빛나는",
  "용감한",
  "현명한",
  "신비로운",
  "고요한",
  "거대한",
  "날으는",
  "친절한",
  "행복한",
];
const nouns = [
  "호랑이",
  "독수리",
  "돌고래",
  "사자",
  "여우",
  "거북이",
  "나무늘보",
  "코알라",
  "북극곰",
  "사막여우",
];

export function generateNickname(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}
