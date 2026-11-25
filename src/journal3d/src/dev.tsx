/** Development harness: mounts the journal on its own so it can be checked
 *  without the rest of the site. */

import { mountJournal } from "./main";
import { devPages } from "./devPages";

const labels = {
  open: "打开日记本 / Open the book",
  close: "合上 / Close",
  shut: "封面已合上 / Cover closed",
  hint: "点一下封面，翻开这本手账",
  prev: "上一个场景 / Previous scene",
  next: "下一个场景 / Next scene",
  panelClose: "关闭 / Close",
  page: "页 / Page",
  loading: "正在画纸…",
  unsupported: "这台设备暂时无法显示 3D 内容",
};

const el = document.getElementById("mount");
if (el) {
  mountJournal(el, { locale: "zh", assetBase: "../../assets/", labels, pages: devPages });
}
