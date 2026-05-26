export const handleSocialShare = async (post) => {
  const shareUrl = `${window.location.origin}/feed`; // Swap with specific post URL later if needed
  const shareTitle = post.title;
  const shareText = `Check out this latest update on EducatorIO: "${shareTitle}"`;

  // 1. If user is on a mobile phone (Web Share API)
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return;
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error sharing:', err);
    }
  }

  // 2. Desktop Fallback: Open WhatsApp Web directly
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  window.open(whatsappUrl, '_blank');
};