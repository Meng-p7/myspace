/* =========================================================
   Moon Portfolio — Content Data (ZH / EN)
   Loaded BEFORE js/main.js. Edit this file only to change
   copy, projects or journal spreads — no build step needed.
     I18N[key].projects       -> gallery cards (num/title/description/
                                 image/tags/github/projectUrl)
     I18N[key].journalSpreads -> flipbook spreads, 2 per spread
                                 (leftHtml / rightHtml)
========================================================= */

/* =========================================================
   BILINGUAL CONTENT DATA (ZH / EN)
========================================================= */
let currentLang = "zh";

const I18N = {
  zh: {
    nav: { home: "Home", work: "Work", journal: "Journal", contact: "Contact" },
    aboutBio: "你好，我是 Moon。对智能硬件、人工智能与富有叙事感的数字交互充满好奇，喜欢把脑海里的草图变成真实可触碰的作品。",
    homeTagline: "机械工程 · 机器人 · 数字创作",
    labelIdentity: "Identity",
    labelAge: "Age",
    labelLocation: "Location",
    aboutIdentity: "机械设计制造及其自动化 · 华东理工大学",
    aboutLocation: "中国 · 上海",
    copyBtn: "复制",
    copiedBtn: "已复制 ✓",
    projectsTitle: "Selected Work",
    paperIntroKicker: "Selected Work",
    paperIntroText: "下面几件，是把想法真正做出来之后留下的东西。",
    workTitle: "Selected Work",
    workIntro:
      "我做的项目大致分两类：一类是让机器人真的动起来的工程与研究，另一类是让日常更顺手的数字产品。每一条都写了背景、我做了什么、结果如何，以及没做好的地方。",
    workGroups: [
      { index: "A", title: "工程与机器人", count: "03 entries" },
      { index: "B", title: "数字产品与创意实验", count: "01 entry" },
    ],
    contactTitle: "Let's talk",
    contactLead:
      "如果你也在做机器人、嵌入式或者带点叙事感的产品，欢迎写信给我。技术问题、项目合作，或者只是想聊聊，都行。",
    projects: [
      {
        num: "01",
        title: "Bimanual Folding",
        group: "A",
        span: "wide",
        year: "2026 · Research",
        caseStudy: "work/bimanual-folding.html",
        tone: "light",
        description: "暑期科研项目：双 Piper 机械臂协同折毛巾，基于 ACT 模仿学习与 physical_ai_runtime，自研细指夹爪并完成 150 次试验评估。",
        image: "assets/bimanual-folding.webp",
        ar: "1006 / 628",
        imageSm: "assets/bimanual-folding-sm.webp",
        tags: ["Research", "Bimanual", "Imitation Learning"],
        projectUrl: "https://dream25851.github.io/Bimanual_Folding/",
        projectLabel: "Project ↗",
        github: "https://github.com/dream25851/Bimanual_Folding"
      },
      {
        num: "02",
        title: "ROBOCON Competition Robot",
        group: "A",
        span: "narrow",
        year: "2026 · Competition",
        caseStudy: "work/robocon.html",
        tone: "light",
        description: "竞赛项目：华东理工大学 ROBOCON2026 参赛机器人，集成麦轮底盘、同步带传动与气动执行机构。",
        image: "assets/robocon.webp",
        ar: "1168 / 880",
        imageSm: "assets/robocon-sm.webp",
        tags: ["ROBOCON", "Mechatronics", "CAD"]
      },
      {
        num: "03",
        title: "PiperSim",
        group: "A",
        span: "narrow",
        year: "2026 · Open source",
        caseStudy: "work/piper-sim.html",
        description: "基于 ROS 2 的 AgileX Piper 六轴机械臂工作区：MoveIt 运动规划、MuJoCo 仿真、SocketCAN 真机控制与手眼标定。",
        image: "assets/arm-simulation.webp",
        ar: "1200 / 896",
        imageSm: "assets/arm-simulation-sm.webp",
        tags: ["ROS 2", "MuJoCo", "MoveIt"],
        github: "https://github.com/Meng-p7/PiperSim"
      },
      {
        num: "04",
        title: "LifeOS",
        group: "B",
        span: "wide",
        year: "2025 — now · Personal",
        caseStudy: "work/lifeos.html",
        tone: "light",
        description: "个人生活工作台：考试倒计时、任务管理、番茄钟与健身打卡。",
        image: "assets/lifeos.webp",
        ar: "1187 / 767",
        imageSm: "assets/lifeos-sm.webp",
        tags: ["Web App", "Productivity", "Local-first"],
        projectUrl: "https://meng-p7.github.io/LifeOs/",
        projectLabel: "Website ↗",
        github: "https://github.com/Meng-p7/LifeOs"
      }
    ],
    journalPages: [
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
        handnote: "焊坏的板子，比写对的代码多。",
        image: {
          src: "journal-deskpet",
          alt: "My first desktop pet built from servos, wires and an ultrasonic sensor",
          caption: "舵机和一堆没整理过的飞线"
        },
      },
      {
        id: "p03",
        sceneId: 1,
        pageNumber: 3,
        kicker: "THE LAB",
        kickerRight: "HUMANOID",
        handnote: "第一次意识到，机器人可以安静地坐在人对面。",
        image: {
          src: "journal-humanoid",
          alt: "A humanoid robot sitting quietly at a table during a research internship",
          caption: "科研实习第一次见到的人形机器人"
        },
      },
      {
        id: "p04",
        sceneId: 1,
        pageNumber: 4,
        kicker: "FIELD NOTES",
        kickerRight: "BIMANUAL",
        title: "从图纸到会动的机器",
        body: "课本里的连杆和电机，在实验室里变成会抓、会放的关节。我开始关心力矩、延迟，和一次成功背后的几百次失败。",
        sketch: "linkage",
      },
      {
        id: "p05",
        sceneId: 2,
        pageNumber: 5,
        kicker: "ENTRY 03",
        kickerRight: "US",
        title: "有人一起看这些",
        body: "她不太懂我在调什么，但会在我熬夜时递水，也会把每一次“终于跑通了”当成值得庆祝的事。",
        quote: "最好的实验搭子，不一定在同一个实验室。",
      },
      {
        id: "p06",
        sceneId: 2,
        pageNumber: 6,
        kicker: "WITH HER",
        kickerRight: "US",
        handnote: "她说我站过去显矮，我说是鞋子的问题。",
        image: {
          src: "journal-us",
          alt: "Illustration of us standing in front of a height chart together",
          caption: "一起比身高的那天"
        },
      },
      {
        id: "p07",
        sceneId: 3,
        pageNumber: 7,
        kicker: "ON THE ROAD",
        kickerRight: "NIGHT",
        handnote: "关掉电脑，世界还在运行。",
        image: {
          src: "journal-night-city",
          alt: "Night skyline across the river with a ferris wheel",
          caption: "江边的夜，灯比星星亮"
        },
      },
      {
        id: "p08",
        sceneId: 3,
        pageNumber: 8,
        kicker: "ENTRY 04",
        kickerRight: "ELSEWHERE",
        title: "把工位关掉，去看别的城市",
        body: "项目不会因为你请两天假就停下来。走出去才发现，很多问题的答案不在屏幕上——在河边、在路上、在一顿很慢的饭里。",
      },
      {
        id: "p09",
        sceneId: 3,
        pageNumber: 9,
        kicker: "ENTRY 05",
        kickerRight: "LANDSCAPE",
        title: "雾还没散的湖",
        body: "水是那种不真实的绿，一棵枯树从湖心长出来。我站了很久，什么也没想——这在过去一年里很少见。",
      },
      {
        id: "p10",
        sceneId: 3,
        pageNumber: 10,
        kicker: "CLOSING NOTE",
        kickerRight: "MIDNIGHT",
        handnote: "— Moon, Shanghai",
        image: {
          src: "journal-lake",
          alt: "A turquoise mountain lake with fog and a bare tree",
          caption: "山里的湖，雾还没散"
        },
      },
    ],    backToTop: "↑ Back to top"
  },
  en: {
    nav: { home: "Home", work: "Work", journal: "Journal", contact: "Contact" },
    aboutBio: "Hi, I'm Moon. Curious about intelligent hardware, artificial intelligence, and narrative-driven digital interaction—turning sketches in my mind into tangible creations.",
    homeTagline: "Mechanical engineering · Robotics · Digital craft",
    labelIdentity: "Identity",
    labelAge: "Age",
    labelLocation: "Location",
    aboutIdentity: "Mechanical Engineering · B.S. Candidate, ECUST",
    aboutLocation: "Shanghai, China",
    copyBtn: "Copy",
    copiedBtn: "Copied ✓",
    projectsTitle: "Selected Work",
    paperIntroKicker: "Selected Work",
    paperIntroText: "What follows is what was left behind after the ideas were actually built.",
    workTitle: "Selected Work",
    workIntro:
      "My work splits roughly in two: the engineering and research that makes robots actually move, and the digital products that make an ordinary day run smoother. Each entry covers the background, what I did, how it turned out, and what I would do differently.",
    workGroups: [
      { index: "A", title: "Engineering & Robotics", count: "03 entries" },
      { index: "B", title: "Digital Products & Creative Experiments", count: "01 entry" },
    ],
    contactTitle: "Let's talk",
    contactLead:
      "If you are working on robots, embedded systems, or products that try to tell a story, write to me. Technical questions, collaboration, or just a conversation — all welcome.",
    projects: [
      {
        num: "01",
        title: "Bimanual Folding",
        tone: "light",
        description: "Summer research: two Piper arms folding towels together, built on ACT imitation learning and physical_ai_runtime, with custom slim fingers and a 150-trial evaluation.",
        image: "assets/bimanual-folding.webp",
        ar: "1006 / 628",
        imageSm: "assets/bimanual-folding-sm.webp",
        tags: ["Research", "Bimanual", "Imitation Learning"],
        projectUrl: "https://dream25851.github.io/Bimanual_Folding/",
        projectLabel: "Project ↗",
        github: "https://github.com/dream25851/Bimanual_Folding"
      },
      {
        num: "02",
        title: "ROBOCON Competition Robot",
        tone: "light",
        description: "Custom-built ECUST ROBOCON2026 robot integrating omni-wheel drive, belt transmissions, and pneumatic actuators.",
        image: "assets/robocon.webp",
        ar: "1168 / 880",
        imageSm: "assets/robocon-sm.webp",
        tags: ["ROBOCON", "Mechatronics", "CAD"]
      },
      {
        num: "03",
        title: "PiperSim",
        description: "A ROS 2 workspace for the AgileX Piper six-axis arm: MoveIt planning, MuJoCo simulation, SocketCAN hardware control and eye-to-hand calibration.",
        image: "assets/arm-simulation.webp",
        ar: "1200 / 896",
        imageSm: "assets/arm-simulation-sm.webp",
        tags: ["ROS 2", "MuJoCo", "MoveIt"],
        github: "https://github.com/Meng-p7/PiperSim"
      },
      {
        num: "04",
        title: "LifeOS",
        tone: "light",
        description: "A personal life-OS workbench: exam countdown, tasks, pomodoro timer and fitness logging .",
        image: "assets/lifeos.webp",
        ar: "1187 / 767",
        imageSm: "assets/lifeos-sm.webp",
        tags: ["Web App", "Productivity", "Local-first"],
        projectUrl: "https://meng-p7.github.io/LifeOs/",
        projectLabel: "Website ↗",
        github: "https://github.com/Meng-p7/LifeOs"
      }
    ],
    journalPages: [
      {
        id: "p01",
        sceneId: 0,
        pageNumber: 1,
        kicker: "ENTRY 01",
        kickerRight: "FIRST BUILD",
        title: "It Started With Jumper Wires",
        body: "My first brush with embedded systems was a dev board, a servo and an ultrasonic sensor. Wrong wire? Pull it out and try again — until it raised an arm and waved back.",
        quote: "“It only knew three moves. But it was the first time an idea actually moved.”",
      },
      {
        id: "p02",
        sceneId: 0,
        pageNumber: 2,
        kicker: "DESK PET",
        kickerRight: "V0.1",
        handnote: "More burnt boards than correct code.",
        image: {
          src: "journal-deskpet",
          alt: "My first desktop pet built from servos and wires",
          caption: "Servos and a nest of loose wires"
        },
      },
      {
        id: "p03",
        sceneId: 1,
        pageNumber: 3,
        kicker: "THE LAB",
        kickerRight: "HUMANOID",
        handnote: "The first time I realised a robot could sit quietly across from a person.",
        image: {
          src: "journal-humanoid",
          alt: "A humanoid robot sitting quietly at a table during a research internship",
          caption: "The first humanoid I met on a research internship"
        },
      },
      {
        id: "p04",
        sceneId: 1,
        pageNumber: 4,
        kicker: "FIELD NOTES",
        kickerRight: "BIMANUAL",
        title: "From Drawings to Moving Machines",
        body: "Linkages and motors from the textbook became joints that grasp and release. I started caring about torque, latency, and the hundreds of failures behind one success.",
        sketch: "linkage",
      },
      {
        id: "p05",
        sceneId: 2,
        pageNumber: 5,
        kicker: "ENTRY 03",
        kickerRight: "US",
        title: "Someone to Share It With",
        body: "She doesn't follow what I'm tuning, but she hands me water at midnight and treats every “it finally runs” as something worth celebrating.",
        quote: "The best lab partner isn't always in the same lab.",
      },
      {
        id: "p06",
        sceneId: 2,
        pageNumber: 6,
        kicker: "WITH HER",
        kickerRight: "US",
        handnote: "She said I looked short up there. I blamed the shoes.",
        image: {
          src: "journal-us",
          alt: "Illustration of us standing in front of a height chart together",
          caption: "Us, at the height chart"
        },
      },
      {
        id: "p07",
        sceneId: 3,
        pageNumber: 7,
        kicker: "ON THE ROAD",
        kickerRight: "NIGHT",
        handnote: "Close the laptop. The world keeps running.",
        image: {
          src: "journal-night-city",
          alt: "Night skyline across the river with a ferris wheel",
          caption: "Lights along the river, brighter than the stars"
        },
      },
      {
        id: "p08",
        sceneId: 3,
        pageNumber: 8,
        kicker: "ENTRY 04",
        kickerRight: "ELSEWHERE",
        title: "Shut the Desk, Go See Another City",
        body: "A project won't pause because you took two days off. Some answers aren't on a screen — they're by the river, on the road, in a very slow dinner.",
      },
      {
        id: "p09",
        sceneId: 3,
        pageNumber: 9,
        kicker: "ENTRY 05",
        kickerRight: "LANDSCAPE",
        title: "A Lake the Fog Hasn't Left",
        body: "The water was an unreal green, a bare tree standing up out of the middle. I stood there thinking nothing at all — rare in the past year.",
      },
      {
        id: "p10",
        sceneId: 3,
        pageNumber: 10,
        kicker: "CLOSING NOTE",
        kickerRight: "MIDNIGHT",
        handnote: "— Moon, Shanghai",
        image: {
          src: "journal-lake",
          alt: "A turquoise mountain lake with fog and a bare tree",
          caption: "A lake in the mountains, still under fog"
        },
      },
    ],    backToTop: "↑ Back to top"
  }
};
