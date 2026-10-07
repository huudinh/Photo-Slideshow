export const FAMILY_QUOTES: string[] = [
  'Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc.',
  'Nhà không chỉ là nơi để về, nhà là nơi trái tim luôn cảm thấy bình yên.',
  'Hạnh phúc giản đơn là bữa cơm sum vầy có đủ đầy các thành viên.',
  'Mỗi bức ảnh là một chiếc vé quay về khoảnh khắc tươi đẹp của yêu thương.',
  'Cảm ơn vì chúng ta luôn là một gia đình, cùng nhau sẻ chia mọi buồn vui.',
  'Con cái là món quà vô giá nhất mà cuộc đời trao tặng cho cha mẹ.',
  'Nụ cười của người thân yêu là ánh mặt trời xua tan mọi mệt mỏi.',
  'Đi thật xa để trở về, và nhận ra không đâu ấm áp bằng mái ấm gia đình.',
  'Thời gian trôi đi, kỷ niệm ở lại trong từng ánh mắt và nụ cười.',
  'Yêu thương trao đi là yêu thương còn mãi mãi.'
];

export function getRandomQuote(): string {
  const index = Math.floor(Math.random() * FAMILY_QUOTES.length);
  return FAMILY_QUOTES[index];
}
