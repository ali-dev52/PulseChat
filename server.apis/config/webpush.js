import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BM8roNvRt-loHBY71YOPSC1N7OteNGrSkQtcQx5xIooJro9aymMpKQ1z6yViD0mtsII-GRryLMhLBXiNCg0D2pE";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "kLi36tov3EcWqOG11ozxDcVHHGnXdJ_iDlSLNsaxED0";

webpush.setVapidDetails(
  'mailto:admin@pulsechat.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default webpush;
