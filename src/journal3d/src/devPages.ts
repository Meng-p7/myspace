/** Sample pages for the development harness. The real journal text lives in the
 *  MySpace content file and is handed to the module when it mounts. */

import type { JournalPage } from "./core/content";

export const devPages: JournalPage[] = [
  {
    id: "p01",
    sceneId: 0,
    pageNumber: 1,
    kicker: "ENTRY 01",
    kickerRight: "FIRST BUILD",
    title: "从一堆杜邦线开始",
    body: "第一次碰嵌入式，是给一块开发板接上舵机。线接错了就拔掉重来，直到它抬起胳膊，跟我打了个招呼。",
    quote: "“它只会三个动作，但那是我第一次让想法真的动起来。”",
  },
  {
    id: "p02",
    sceneId: 0,
    pageNumber: 2,
    kicker: "DESK PET",
    kickerRight: "V0.1",
    image: { src: "journal-deskpet", alt: "桌宠", caption: "舵机和一堆没整理过的飞线" },
    handnote: "焊坏的板子，比写对的代码多。",
  },
  {
    id: "p03",
    sceneId: 1,
    pageNumber: 3,
    kicker: "THE LAB",
    kickerRight: "HUMANOID",
    image: { src: "journal-humanoid", alt: "人形机器人", caption: "科研实习第一次见到的人形机器人" },
    handnote: "第一次意识到，机器人可以安静地坐在人对面。",
  },
  {
    id: "p04",
    sceneId: 1,
    pageNumber: 4,
    kicker: "FIELD NOTES",
    kickerRight: "BIMANUAL",
    title: "从图纸到会动的机器",
    body: "课本里的连杆和电机，在实验室里变成会抓、会放的关节。",
  },
  {
    id: "p07",
    sceneId: 3,
    pageNumber: 7,
    kicker: "ON THE ROAD",
    kickerRight: "NIGHT",
    image: { src: "journal-night-city", alt: "江边的夜", caption: "江边的夜，灯比星星亮" },
    handnote: "关掉电脑，世界还在运行。",
  },
  {
    id: "p10",
    sceneId: 3,
    pageNumber: 10,
    kicker: "CLOSING NOTE",
    kickerRight: "MIDNIGHT",
    image: { src: "journal-lake", alt: "山里的湖", caption: "山里的湖，雾还没散" },
    sign: "— Moon, Shanghai",
  },
];
