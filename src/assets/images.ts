import heroBanner from './images/lexus_hero_banner_1791194835767.jpg';
import lbxCar from './images/lexus_lbx_ux_1791194852337.jpg';
import rxSport from './images/lexus_rx_sport_1791194864800.jpg';
import lxVip from './images/lexus_lx_vip_1791194879000.jpg';
import lcLfa from './images/lexus_lc_lfa_1791194891293.jpg';
import emblemLuxury from './images/lexus_emblem_luxury_1791194904456.jpg';

export const LEXUS_IMAGES = {
  heroBanner,
  lbxCar,
  rxSport,
  lxVip,
  lcLfa,
  emblemLuxury,
  // Model specific mappings
  lbx: lbxCar,
  ux: lbxCar,
  nx: rxSport,
  rx: rxSport,
  rz: rxSport,
  gx: lxVip,
  lx: lxVip,
  lc: lcLfa,
  lfa: lcLfa,
};

export default LEXUS_IMAGES;
