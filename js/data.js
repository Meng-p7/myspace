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
    nav: { home: "Home", about: "About", projects: "Projects", journal: "Journal" },
    aboutBio: "你好，我是 Moon。对智能硬件、人工智能与富有叙事感的数字交互充满好奇，喜欢把脑海里的草图变成真实可触碰的作品。",
    labelIdentity: "Identity",
    labelAge: "Age",
    labelLocation: "Location",
    aboutIdentity: "机械设计制造及其自动化 · 华东理工大学",
    aboutLocation: "中国 · 上海",
    copyBtn: "复制",
    copiedBtn: "已复制 ✓",
    projectsTitle: "My Projects",
    projects: [
      {
        num: "01",
        title: "Bimanual Folding",
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
    journalSpreads: [
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 01</span><span>FIRST BUILD</span></div>
            <h3 class="j-title">从一堆杜邦线开始</h3>
            <p class="j-body">第一次碰嵌入式，是给一块开发板接上舵机。线接错了就拔掉重来，直到它抬起胳膊，跟我打了个招呼。</p>
            <div class="j-sticky-note">“它只会三个动作，但那是我第一次让想法真的动起来。”</div>
          </div>
          <div class="j-page-num">01</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>DESK PET</span><span>V0.1</span></div>
            <div class="j-polaroid tilt-right">
              <div class="j-tape"></div>
              <img src="assets/journal-deskpet.webp" srcset="assets/journal-deskpet-sm.webp 560w, assets/journal-deskpet.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="My first desktop pet built from servos, wires and an ultrasonic sensor" />
              <div class="j-polaroid-cap">舵机和一堆没整理过的飞线</div>
            </div>
            <p class="j-handnote">焊坏的板子，比写对的代码多。</p>
          </div>
          <div class="j-page-num">02</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>THE LAB</span><span>HUMANOID</span></div>
            <div class="j-polaroid tilt-left" style="max-width:62%;">
              <div class="j-tape"></div>
              <img src="assets/journal-humanoid.webp" srcset="assets/journal-humanoid-sm.webp 560w, assets/journal-humanoid.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="A humanoid robot sitting quietly at a table during a research internship" style="aspect-ratio:3/4;" />
              <div class="j-polaroid-cap">科研实习第一次见到的人形机器人</div>
            </div>
            <p class="j-handnote">第一次意识到，机器人可以安静地坐在人对面。</p>
          </div>
          <div class="j-page-num">03</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>FIELD NOTES</span><span>BIMANUAL</span></div>
            <h3 class="j-title">从图纸到会动的机器</h3>
            <p class="j-body">课本里的连杆和电机，在实验室里变成会抓、会放的关节。我开始关心力矩、延迟，和一次成功背后的几百次失败。</p>
            <div class="j-sketch-box">
              <svg viewBox="0 0 260 95" fill="none" style="width:100%;height:auto;">
                <circle cx="42" cy="52" r="20" stroke="#171717" stroke-width="1.3" stroke-dasharray="3 3"/>
                <line x1="62" y1="52" x2="128" y2="34" stroke="#2563eb" stroke-width="1.8"/>
                <line x1="128" y1="34" x2="205" y2="58" stroke="#171717" stroke-width="1.5"/>
                <circle cx="128" cy="34" r="4" fill="#faf7ef" stroke="#171717" stroke-width="1.5"/>
                <circle cx="205" cy="58" r="5" fill="#2563eb"/>
                <text x="14" y="18" fill="#7a7872" font-family="JetBrains Mono, monospace" font-size="9">LINKAGE SKETCH // θ₁ → θ₂</text>
              </svg>
            </div>
          </div>
          <div class="j-page-num">04</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 03</span><span>US</span></div>
            <h3 class="j-title">有人一起看这些</h3>
            <p class="j-body">她不太懂我在调什么，但会在我熬夜时递水，也会把每一次“终于跑通了”当成值得庆祝的事。</p>
            <div class="j-sticky-note" style="background:#e6efff;color:#1e3a8a;transform:rotate(1.4deg);">
              最好的实验搭子，不一定在同一个实验室。
            </div>
          </div>
          <div class="j-page-num">05</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>WITH HER</span><span>US</span></div>
            <div class="j-polaroid tilt-right" style="max-width:62%;">
              <div class="j-tape"></div>
              <img src="assets/journal-us.webp" srcset="assets/journal-us-sm.webp 560w, assets/journal-us.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="Illustration of us standing in front of a height chart together" style="aspect-ratio:3/4;" />
              <div class="j-polaroid-cap">一起比身高的那天</div>
            </div>
            <p class="j-handnote">她说我站过去显矮，我说是鞋子的问题。</p>
          </div>
          <div class="j-page-num">06</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ON THE ROAD</span><span>NIGHT</span></div>
            <div class="j-polaroid tilt-left">
              <div class="j-tape"></div>
              <img src="assets/journal-night-city.webp" srcset="assets/journal-night-city-sm.webp 560w, assets/journal-night-city.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="Night skyline across the river with a ferris wheel" />
              <div class="j-polaroid-cap">江边的夜，灯比星星亮</div>
            </div>
            <p class="j-handnote">关掉电脑，世界还在运行。</p>
          </div>
          <div class="j-page-num">07</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 04</span><span>ELSEWHERE</span></div>
            <h3 class="j-title">把工位关掉，去看别的城市</h3>
            <p class="j-body">项目不会因为你请两天假就停下来。走出去才发现，很多问题的答案不在屏幕上——在河边、在路上、在一顿很慢的饭里。</p>
          </div>
          <div class="j-page-num">08</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 05</span><span>LANDSCAPE</span></div>
            <h3 class="j-title">雾还没散的湖</h3>
            <p class="j-body">水是那种不真实的绿，一棵枯树从湖心长出来。我站了很久，什么也没想——这在过去一年里很少见。</p>
          </div>
          <div class="j-page-num">09</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>CLOSING NOTE</span><span>MIDNIGHT</span></div>
            <div class="j-polaroid tilt-right">
              <div class="j-tape"></div>
              <img src="assets/journal-lake.webp" srcset="assets/journal-lake-sm.webp 560w, assets/journal-lake.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="A turquoise mountain lake with fog and a bare tree" />
              <div class="j-polaroid-cap">山里的湖，雾还没散</div>
            </div>
            <p class="j-handnote" style="margin-top:1.2rem;">— Moon, Shanghai</p>
          </div>
          <div class="j-page-num">10</div>
        `
      }
    ],
    backToTop: "↑ Back to top"
  },
  en: {
    nav: { home: "Home", about: "About", projects: "Projects", journal: "Journal" },
    aboutBio: "Hi, I'm Moon. Curious about intelligent hardware, artificial intelligence, and narrative-driven digital interaction—turning sketches in my mind into tangible creations.",
    labelIdentity: "Identity",
    labelAge: "Age",
    labelLocation: "Location",
    aboutIdentity: "Mechanical Engineering · B.S. Candidate, ECUST",
    aboutLocation: "Shanghai, China",
    copyBtn: "Copy",
    copiedBtn: "Copied ✓",
    projectsTitle: "My Projects",
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
    journalSpreads: [
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 01</span><span>FIRST BUILD</span></div>
            <h3 class="j-title">It Started With Jumper Wires</h3>
            <p class="j-body">My first brush with embedded systems was a dev board, a servo and an ultrasonic sensor. Wrong wire? Pull it out and try again — until it raised an arm and waved back.</p>
            <div class="j-sticky-note">“It only knew three moves. But it was the first time an idea actually moved.”</div>
          </div>
          <div class="j-page-num">01</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>DESK PET</span><span>V0.1</span></div>
            <div class="j-polaroid tilt-right">
              <div class="j-tape"></div>
              <img src="assets/journal-deskpet.webp" srcset="assets/journal-deskpet-sm.webp 560w, assets/journal-deskpet.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="My first desktop pet built from servos and wires" />
              <div class="j-polaroid-cap">Servos and a nest of loose wires</div>
            </div>
            <p class="j-handnote">More burnt boards than correct code.</p>
          </div>
          <div class="j-page-num">02</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>THE LAB</span><span>HUMANOID</span></div>
            <div class="j-polaroid tilt-left" style="max-width:62%;">
              <div class="j-tape"></div>
              <img src="assets/journal-humanoid.webp" srcset="assets/journal-humanoid-sm.webp 560w, assets/journal-humanoid.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="A humanoid robot sitting quietly at a table during a research internship" style="aspect-ratio:3/4;" />
              <div class="j-polaroid-cap">The first humanoid I met on a research internship</div>
            </div>
            <p class="j-handnote">The first time I realised a robot could sit quietly across from a person.</p>
          </div>
          <div class="j-page-num">03</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>FIELD NOTES</span><span>BIMANUAL</span></div>
            <h3 class="j-title">From Drawings to Moving Machines</h3>
            <p class="j-body">Linkages and motors from the textbook became joints that grasp and release. I started caring about torque, latency, and the hundreds of failures behind one success.</p>
            <div class="j-sketch-box">
              <svg viewBox="0 0 260 95" fill="none" style="width:100%;height:auto;">
                <circle cx="42" cy="52" r="20" stroke="#171717" stroke-width="1.3" stroke-dasharray="3 3"/>
                <line x1="62" y1="52" x2="128" y2="34" stroke="#2563eb" stroke-width="1.8"/>
                <line x1="128" y1="34" x2="205" y2="58" stroke="#171717" stroke-width="1.5"/>
                <circle cx="128" cy="34" r="4" fill="#faf7ef" stroke="#171717" stroke-width="1.5"/>
                <circle cx="205" cy="58" r="5" fill="#2563eb"/>
                <text x="14" y="18" fill="#7a7872" font-family="JetBrains Mono, monospace" font-size="9">LINKAGE SKETCH // θ₁ → θ₂</text>
              </svg>
            </div>
          </div>
          <div class="j-page-num">04</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 03</span><span>US</span></div>
            <h3 class="j-title">Someone to Share It With</h3>
            <p class="j-body">She doesn't follow what I'm tuning, but she hands me water at midnight and treats every “it finally runs” as something worth celebrating.</p>
            <div class="j-sticky-note" style="background:#e6efff;color:#1e3a8a;transform:rotate(1.4deg);">
              The best lab partner isn't always in the same lab.
            </div>
          </div>
          <div class="j-page-num">05</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>WITH HER</span><span>US</span></div>
            <div class="j-polaroid tilt-right" style="max-width:62%;">
              <div class="j-tape"></div>
              <img src="assets/journal-us.webp" srcset="assets/journal-us-sm.webp 560w, assets/journal-us.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="Illustration of us standing in front of a height chart together" style="aspect-ratio:3/4;" />
              <div class="j-polaroid-cap">Us, at the height chart</div>
            </div>
            <p class="j-handnote">She said I looked short up there. I blamed the shoes.</p>
          </div>
          <div class="j-page-num">06</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ON THE ROAD</span><span>NIGHT</span></div>
            <div class="j-polaroid tilt-left">
              <div class="j-tape"></div>
              <img src="assets/journal-night-city.webp" srcset="assets/journal-night-city-sm.webp 560w, assets/journal-night-city.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="Night skyline across the river with a ferris wheel" />
              <div class="j-polaroid-cap">Lights along the river, brighter than the stars</div>
            </div>
            <p class="j-handnote">Close the laptop. The world keeps running.</p>
          </div>
          <div class="j-page-num">07</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 04</span><span>ELSEWHERE</span></div>
            <h3 class="j-title">Shut the Desk, Go See Another City</h3>
            <p class="j-body">A project won't pause because you took two days off. Some answers aren't on a screen — they're by the river, on the road, in a very slow dinner.</p>
          </div>
          <div class="j-page-num">08</div>
        `
      },
      {
        leftHtml: `
          <div>
            <div class="j-meta-row"><span>ENTRY 05</span><span>LANDSCAPE</span></div>
            <h3 class="j-title">A Lake the Fog Hasn't Left</h3>
            <p class="j-body">The water was an unreal green, a bare tree standing up out of the middle. I stood there thinking nothing at all — rare in the past year.</p>
          </div>
          <div class="j-page-num">09</div>
        `,
        rightHtml: `
          <div>
            <div class="j-meta-row"><span>CLOSING NOTE</span><span>MIDNIGHT</span></div>
            <div class="j-polaroid tilt-right">
              <div class="j-tape"></div>
              <img src="assets/journal-lake.webp" srcset="assets/journal-lake-sm.webp 560w, assets/journal-lake.webp 1000w" sizes="(max-width: 820px) 76vw, 300px" loading="lazy" decoding="async" alt="A turquoise mountain lake with fog and a bare tree" />
              <div class="j-polaroid-cap">A lake in the mountains, still under fog</div>
            </div>
            <p class="j-handnote" style="margin-top:1.2rem;">— Moon, Shanghai</p>
          </div>
          <div class="j-page-num">10</div>
        `
      }
    ],
    backToTop: "↑ Back to top"
  }
};
