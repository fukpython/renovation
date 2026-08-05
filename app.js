/**
 * 装修管家 - Vue 3 应用
 * 白哥家装修进度管理工具
 * v4: 全量优化版 - 桌面端入口/支出删除/照片存储/MQTT冲突/延期标记/批量上传/日期分组/搜索/操作记录/今日要点/分类自定义/阶段预算/验收记录
 */

const { createApp, ref, reactive, shallowReactive, computed, onMounted, watch, nextTick } = Vue;

/* ===================== 默认数据 ===================== */

const DEFAULT_DATA = {
  project: {
    name: "白哥家装修",
    address: "福州",
    startDate: "2026-08-10",
    endDate: "2026-12-20",
    totalBudget: 250000
  },
  stages: [
    { id: 1, name: "设计确认", startDate: "2026-08-10", endDate: "2026-08-15", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 2, name: "主体拆改", startDate: "2026-08-16", endDate: "2026-08-22", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 3, name: "阳台封窗", startDate: "2026-08-23", endDate: "2026-08-30", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 4, name: "水电改造", startDate: "2026-08-31", endDate: "2026-09-10", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 5, name: "泥瓦工程", startDate: "2026-09-11", endDate: "2026-09-30", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 6, name: "木工工程", startDate: "2026-10-01", endDate: "2026-10-15", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 7, name: "油漆工程", startDate: "2026-10-16", endDate: "2026-11-05", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 8, name: "全屋定制", startDate: "2026-11-06", endDate: "2026-11-20", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 9, name: "安装工程", startDate: "2026-11-21", endDate: "2026-12-05", status: "pending", contractor: "", notes: "", acceptedItems: [] },
    { id: 10, name: "软装入住", startDate: "2026-12-06", endDate: "2026-12-20", status: "pending", contractor: "", notes: "", acceptedItems: [] }
  ],
  tasks: [
    { id: 1, name: "户型测量与设计方案", stage: "设计确认", startDate: "2026-08-10", endDate: "2026-08-13", status: "pending", progress: 0 },
    { id: 2, name: "设计方案确认定稿", stage: "设计确认", startDate: "2026-08-14", endDate: "2026-08-15", status: "pending", progress: 0 },
    { id: 3, name: "墙体拆除", stage: "主体拆改", startDate: "2026-08-16", endDate: "2026-08-19", status: "pending", progress: 0 },
    { id: 4, name: "垃圾清运", stage: "主体拆改", startDate: "2026-08-20", endDate: "2026-08-22", status: "pending", progress: 0 },
    { id: 5, name: "阳台封窗测量安装", stage: "阳台封窗", startDate: "2026-08-23", endDate: "2026-08-30", status: "pending", progress: 0 },
    { id: 6, name: "水电交底", stage: "水电改造", startDate: "2026-08-31", endDate: "2026-09-01", status: "pending", progress: 0 },
    { id: 7, name: "水电走线施工", stage: "水电改造", startDate: "2026-09-02", endDate: "2026-09-08", status: "pending", progress: 0 },
    { id: 8, name: "水电验收", stage: "水电改造", startDate: "2026-09-09", endDate: "2026-09-10", status: "pending", progress: 0 },
    { id: 9, name: "全屋定制复尺", stage: "全屋定制", startDate: "2026-11-06", endDate: "2026-11-10", status: "pending", progress: 0 },
    { id: 10, name: "全屋定制安装", stage: "全屋定制", startDate: "2026-11-11", endDate: "2026-11-20", status: "pending", progress: 0 }
  ],
  budget: [
    { id: 1, category: "设计费", item: "设计费", budgetAmount: 10000, actualAmount: 0 },
    { id: 2, category: "基础施工", item: "水电改造", budgetAmount: 15000, actualAmount: 0 },
    { id: 3, category: "基础施工", item: "泥瓦工程", budgetAmount: 20000, actualAmount: 0 },
    { id: 4, category: "基础施工", item: "木工工程", budgetAmount: 15000, actualAmount: 0 },
    { id: 5, category: "基础施工", item: "油漆工程", budgetAmount: 10000, actualAmount: 0 },
    { id: 6, category: "门窗", item: "阳台封窗", budgetAmount: 12000, actualAmount: 0 },
    { id: 7, category: "主材", item: "瓷砖", budgetAmount: 20000, actualAmount: 0 },
    { id: 8, category: "主材", item: "地板", budgetAmount: 15000, actualAmount: 0 },
    { id: 9, category: "主材", item: "门窗", budgetAmount: 15000, actualAmount: 0 },
    { id: 10, category: "主材", item: "橱柜", budgetAmount: 20000, actualAmount: 0 },
    { id: 11, category: "主材", item: "卫浴洁具", budgetAmount: 10000, actualAmount: 0 },
    { id: 12, category: "全屋定制", item: "全屋定制", budgetAmount: 40000, actualAmount: 0 },
    { id: 13, category: "家电", item: "家电", budgetAmount: 50000, actualAmount: 0 },
    { id: 14, category: "家具", item: "家具", budgetAmount: 35000, actualAmount: 0 },
    { id: 15, category: "软装", item: "软装布置", budgetAmount: 15000, actualAmount: 0 }
  ],
  photos: [],
  logs: []
};

/* ===================== 验收项模板 ===================== */

const ACCEPTANCE_TEMPLATES = {
  "设计确认": ["方案确认", "图纸定稿", "预算确认"],
  "主体拆改": ["拆改范围确认", "垃圾清运完成", "墙体安全检查"],
  "阳台封窗": ["窗框安装验收", "密封性测试", "排水测试"],
  "水电改造": ["水压试验", "电路绝缘测试", "点位确认", "管线路径确认"],
  "泥瓦工程": ["防水闭水试验", "瓷砖空鼓检查", "平整度检查"],
  "木工工程": ["结构牢固检查", "尺寸核对", "表面平整检查"],
  "油漆工程": ["基层处理检查", "色差检查", "漆面完成确认"],
  "全屋定制": ["尺寸复尺确认", "安装牢固检查", "五金配件检查"],
  "安装工程": ["功能测试", "外观检查", "收口细节确认"],
  "软装入住": ["清洁验收", "空气质量检测", "入住确认"]
};

function getAcceptanceItems(stageName) {
  return ACCEPTANCE_TEMPLATES[stageName] || ["完工验收"];
}

/* ===================== 数据持久化 ===================== */

const STORAGE_KEY = "renovation_app_data";
const DATA_VERSION = 3; // v3: 加 logs, acceptedItems, 照片存储优化

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const version = parsed._version || 1;

      // 浅拷贝默认数据（DEFAULT_DATA 是常量，不会被修改）
      var merged = Object.assign({}, DEFAULT_DATA, parsed);
      merged.stages = parsed.stages || DEFAULT_DATA.stages;
      merged.tasks = parsed.tasks || DEFAULT_DATA.tasks;
      merged.budget = parsed.budget || DEFAULT_DATA.budget;
      merged.photos = parsed.photos || [];
      merged.logs = parsed.logs || [];
      merged.project = parsed.project || DEFAULT_DATA.project;

      // v1 -> v2: 插入新阶段
      if (version < 2) {
        const newStageNames = ["阳台封窗", "全屋定制"];
        const existingNames = (merged.stages || []).map(s => s.name);
        const defaultStages = DEFAULT_DATA.stages;
        const reordered = [];
        for (const ds of defaultStages) {
          if (existingNames.includes(ds.name)) {
            const existing = merged.stages.find(s => s.name === ds.name);
            reordered.push(existing);
          } else {
            reordered.push(Object.assign({}, ds));
          }
        }
        merged.stages = reordered;
        const existingBudgetItems = (merged.budget || []).map(b => b.item);
        for (const db of DEFAULT_DATA.budget) {
          if (!existingBudgetItems.includes(db.item)) merged.budget.push(Object.assign({}, db));
        }
        const existingTaskNames = (merged.tasks || []).map(t => t.name);
        for (const dt of DEFAULT_DATA.tasks) {
          if (!existingTaskNames.includes(dt.name)) merged.tasks.push(Object.assign({}, dt));
        }
      }

      // v2 -> v3: 加 logs, acceptedItems
      if (version < 3) {
        if (!merged.logs) merged.logs = [];
        (merged.stages || []).forEach(s => {
          if (!s.acceptedItems) s.acceptedItems = [];
        });
      }

      // 确保 stages 有 acceptedItems
      (merged.stages || []).forEach(s => {
        if (!s.acceptedItems) s.acceptedItems = [];
      });
      if (!merged.logs) merged.logs = [];

      merged._version = DATA_VERSION;
      // 只在版本升级时才写回 localStorage，避免每次加载都序列化
      if (version < DATA_VERSION) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch(e) {}
      }
      return merged;
    }
  } catch (e) {
    console.error("加载数据失败:", e);
  }
  var fresh = Object.assign({}, DEFAULT_DATA);
  fresh.stages = DEFAULT_DATA.stages.map(s => Object.assign({}, s));
  fresh.tasks = DEFAULT_DATA.tasks.map(t => Object.assign({}, t));
  fresh.budget = DEFAULT_DATA.budget.map(b => Object.assign({}, b));
  fresh.photos = [];
  fresh.logs = [];
  fresh._version = DATA_VERSION;
  return fresh;
}

function saveData(data) {
  try {
    data._version = DATA_VERSION;
    var jsonStr = JSON.stringify(data);
    console.log("[存储] 数据大小:", (jsonStr.length / 1024).toFixed(1), "KB, 照片:", (data.photos || []).length, "张");

    if (jsonStr.length > 4 * 1024 * 1024) {
      // 超过4MB，不含照片保存
      data.photos = [];
      jsonStr = JSON.stringify(data);
      console.warn("[存储] 数据过大，不含照片保存");
    }

    localStorage.setItem(STORAGE_KEY, jsonStr);
  } catch (e) {
    console.error("保存数据失败:", e);
    if (e.name === "QuotaExceededError") {
      try {
        data.photos = [];
        data.logs = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.warn("[存储] 紧急保存（不含照片和日志）");
      } catch (e2) {
        console.error("存储彻底失败:", e2);
      }
    }
  }
}

/* ===================== 工具函数 ===================== */

function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

/* ===================== 图片压缩 ===================== */

function compressImage(file, callback) {
  console.log("[照片] 开始压缩:", file.name, file.type, file.size, "bytes");

  if (!file.type.startsWith("image/")) {
    console.log("[照片] 非图片文件，跳过");
    callback(null);
    return;
  }

  var reader = new FileReader();
  reader.onerror = function() {
    console.error("[照片] FileReader 读取失败");
    callback(null);
  };
  reader.onload = function(event) {
    var img = new Image();
    img.onerror = function() {
      console.error("[照片] Image 加载失败");
      callback(null);
    };
    img.onload = function() {
      try {
        // 根据原始文件大小动态调整压缩参数
        var maxW = 480, maxH = 360, quality = 0.4;
        if (file.size > 3 * 1024 * 1024) {
          maxW = 320; maxH = 240; quality = 0.3;
        } else if (file.size > 1 * 1024 * 1024) {
          maxW = 400; maxH = 300; quality = 0.35;
        }

        var canvas = document.createElement("canvas");
        var w = img.width, h = img.height;
        if (w > maxW) { h = h * maxW / w; w = maxW; }
        if (h > maxH) { w = w * maxH / h; h = maxH; }
        canvas.width = Math.max(1, Math.round(w));
        canvas.height = Math.max(1, Math.round(h));
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var result = canvas.toDataURL("image/jpeg", quality);

        // 某些手机浏览器忽略 quality 参数返回 PNG，检查并处理
        if (result.indexOf("data:image/png") === 0) {
          console.warn("[照片] 浏览器返回PNG，尝试强制JPEG");
          result = canvas.toDataURL("image/jpeg", 0.25);
        }

        // 如果 base64 仍然超过 60KB，进一步压缩质量
        if (result.length > 60000) {
          result = canvas.toDataURL("image/jpeg", 0.2);
        }
        // 如果还是超过 50KB，缩小尺寸
        if (result.length > 50000) {
          var c2 = document.createElement("canvas");
          c2.width = Math.round(canvas.width * 0.7);
          c2.height = Math.round(canvas.height * 0.7);
          c2.getContext("2d").drawImage(canvas, 0, 0, c2.width, c2.height);
          result = c2.toDataURL("image/jpeg", 0.2);
        }
        // 硬性限制：如果仍超过 80KB，继续缩小
        if (result.length > 80000) {
          var c3 = document.createElement("canvas");
          c3.width = Math.round(canvas.width * 0.5);
          c3.height = Math.round(canvas.height * 0.5);
          c3.getContext("2d").drawImage(canvas, 0, 0, c3.width, c3.height);
          result = c3.toDataURL("image/jpeg", 0.15);
        }

        console.log("[照片] 压缩完成:", (result.length / 1024).toFixed(1), "KB");

        // 最终硬性检查：如果超过 100KB，拒绝（防止白屏）
        if (result.length > 100000) {
          console.error("[照片] 压缩后仍超过100KB，拒绝上传");
          callback(null);
          return;
        }

        callback(result);
      } catch (e) {
        console.error("[照片] Canvas 压缩失败:", e);
        callback(null);
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/* ===================== Vue 应用 ===================== */

const __vueApp = createApp({
  setup() {
    // ---- 加载数据 ----
    const savedData = loadData();
    const project = reactive(savedData.project);
    const stages = reactive(savedData.stages);
    const tasks = reactive(savedData.tasks);
    const budget = reactive(savedData.budget);
    const photos = shallowReactive(savedData.photos);
    const logs = reactive(savedData.logs || []);

    // ---- 当前页签 ----
    const currentTab = ref("dashboard");
    const tabs = [
      { id: "dashboard", label: "首页", svg: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>' },
      { id: "schedule", label: "工期", svg: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>' },
      { id: "budget", label: "预算", svg: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>' },
      { id: "process", label: "流程", svg: '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/>' },
      { id: "photos", label: "现场", svg: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>' }
    ];

    const navTitle = computed(() => {
      const tab = tabs.find(t => t.id === currentTab.value);
      return tab ? tab.label : "装修管家";
    });

    // ---- 状态栏时间 ----
    const currentTime = ref("");
    function updateTime() {
      const d = new Date();
      currentTime.value = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    updateTime();
    setInterval(updateTime, 30000);

    // ---- 进度环响应式尺寸 ----
    const isDesktop = ref(window.innerWidth >= 768);
    window.addEventListener("resize", () => {
      isDesktop.value = window.innerWidth >= 768;
    });
    const progressRingSize = computed(() => isDesktop.value ? 100 : 80);
    const progressRingRadius = computed(() => isDesktop.value ? 50 : 40);
    const ringCircumference = computed(() => 2 * Math.PI * (progressRingRadius.value - 6));

    // ---- Toast ----
    const toastMessage = ref("");
    let toastTimer = null;
    function showToast(msg) {
      toastMessage.value = msg;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastMessage.value = ""; }, 2000);
    }

    // ---- 状态文本 ----
    function statusText(status) {
      const map = {
        "pending": "待开始",
        "in-progress": "进行中",
        "completed": "已完成",
        "delayed": "已延期"
      };
      return map[status] || status;
    }

    // ---- 格式化金额 ----
    function formatMoney(amount) {
      if (!amount && amount !== 0) return "¥--";
      return "¥" + Number(amount).toLocaleString("zh-CN");
    }

    // ==================== 操作记录 (任务20) ====================

    function addLog(action, detail) {
      const log = {
        id: Date.now() + Math.random(),
        action: action,
        detail: detail || "",
        time: new Date().toLocaleString("zh-CN"),
        timestamp: Date.now()
      };
      logs.unshift(log);
      if (logs.length > 200) logs.splice(200);
    }

    const showLogModal = ref(false);

    function formatLogAction(action) {
      const map = {
        "add": "新增",
        "edit": "编辑",
        "delete": "删除",
        "start": "开始",
        "complete": "完成",
        "reorder": "排序",
        "budget": "预算",
        "acceptance": "验收",
        "sync": "同步"
      };
      return map[action] || action;
    }

    // ==================== 计算属性 ====================

    // ---- 延期自动检查 (任务16) ----
    function isOverdue(item) {
      if (item.status === "completed") return false;
      const today = new Date(todayStr());
      const end = new Date(item.endDate);
      return today > end;
    }

    function getEffectiveStatus(item) {
      if (item.status === "completed") return "completed";
      if (isOverdue(item)) return "delayed";
      return item.status;
    }

    function checkDelayed() {
      let changed = false;
      tasks.forEach(t => {
        const eff = getEffectiveStatus(t);
        if (eff === "delayed" && t.status !== "delayed") {
          t.status = "delayed";
          changed = true;
        }
      });
      stages.forEach(s => {
        const eff = getEffectiveStatus(s);
        if (eff === "delayed" && s.status !== "delayed") {
          s.status = "delayed";
          changed = true;
        }
      });
      if (changed) {
        addLog("sync", "自动标记延期任务");
      }
    }

    // ---- 总进度 ----
    const overallProgress = computed(() => {
      if (stages.length === 0) return 0;
      const completed = stages.filter(s => s.status === "completed").length;
      const inProgress = stages.filter(s => s.status === "in-progress").length;
      const delayed = stages.filter(s => s.status === "delayed").length;
      return Math.round((completed + inProgress * 0.5 + delayed * 0.3) / stages.length * 100);
    });

    const daysElapsed = computed(() => {
      const today = new Date(todayStr());
      const start = new Date(project.startDate);
      if (today < start) return 0;
      return Math.max(0, daysBetween(project.startDate, todayStr()));
    });

    const daysRemaining = computed(() => {
      const today = new Date(todayStr());
      const end = new Date(project.endDate);
      if (today > end) return 0;
      return Math.max(0, daysBetween(todayStr(), project.endDate));
    });

    const completedStages = computed(() => stages.filter(s => s.status === "completed").length);

    const delayedCount = computed(() => {
      return tasks.filter(t => getEffectiveStatus(t) === "delayed").length +
             stages.filter(s => getEffectiveStatus(s) === "delayed").length;
    });

    const currentStage = computed(() => {
      return stages.find(s => s.status === "in-progress") ||
             stages.find(s => s.status === "pending") ||
             stages.find(s => s.status === "delayed") ||
             null;
    });

    // ---- 预算计算 ----
    const totalSpent = computed(() => budget.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0));
    const remainingBudget = computed(() => project.totalBudget - totalSpent.value);
    const budgetProgress = computed(() => project.totalBudget === 0 ? 0 : (totalSpent.value / project.totalBudget) * 100);

    const totalAllocatedBudget = computed(() => budget.reduce((sum, item) => sum + (Number(item.budgetAmount) || 0), 0));

    const budgetCategories = computed(() => {
      const map = {};
      budget.forEach(item => {
        if (!map[item.category]) {
          map[item.category] = { name: item.category, budget: 0, spent: 0, items: [] };
        }
        map[item.category].budget += Number(item.budgetAmount) || 0;
        map[item.category].spent += Number(item.actualAmount) || 0;
        map[item.category].items.push(item);
      });
      const result = Object.values(map);
      result.forEach(cat => {
        cat.percentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
      });
      return result;
    });

    const categoryNames = computed(() => [...new Set(budget.map(item => item.category))]);

    // ---- 阶段关联预算 (任务23) ----
    const stageBudgets = computed(() => {
      const map = {};
      stages.forEach(s => {
        const stageExpenses = budget.filter(b => b.item === s.name || b.category === s.name);
        const stageBudget = stageExpenses.reduce((sum, b) => sum + (Number(b.budgetAmount) || 0), 0);
        const stageSpent = stageExpenses.reduce((sum, b) => sum + (Number(b.actualAmount) || 0), 0);
        map[s.id] = { budget: stageBudget, spent: stageSpent };
      });
      return map;
    });

    function getStageBudget(stageId) {
      const sb = stageBudgets.value[stageId];
      if (!sb || sb.budget === 0) return null;
      return sb;
    }

    // ---- 最近照片 ----
    const recentPhotos = computed(() => {
      return [...photos].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 3);
    });

    // ---- 待办任务 ----
    const upcomingTasks = computed(() => {
      return tasks
        .filter(t => t.status === "pending" || t.status === "in-progress" || t.status === "delayed")
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);
    });

    // ---- 今日要点 (任务21) ----
    const todayAlerts = computed(() => {
      const today = todayStr();
      const alerts = [];

      // 今日到期的任务
      const todayDue = tasks.filter(t => t.endDate === today && t.status !== "completed");
      if (todayDue.length > 0) {
        alerts.push({ type: "task", icon: "task", color: "warning", title: "今日到期任务", items: todayDue.map(t => t.name) });
      }

      // 超支的预算项
      const overBudget = budget.filter(b => b.actualAmount > b.budgetAmount && b.budgetAmount > 0);
      if (overBudget.length > 0) {
        alerts.push({ type: "budget", icon: "budget", color: "danger", title: "预算超支项", items: overBudget.map(b => b.item) });
      }

      // 待验收的阶段（进行中但未完成全部验收项）
      const pendingAcceptance = stages.filter(s => s.status === "in-progress" && s.acceptedItems && s.acceptedItems.length < getAcceptanceItems(s.name).length);
      if (pendingAcceptance.length > 0) {
        alerts.push({ type: "acceptance", icon: "check", color: "info", title: "待完成验收", items: pendingAcceptance.map(s => s.name) });
      }

      // 延期的任务
      const delayedTasks = tasks.filter(t => getEffectiveStatus(t) === "delayed");
      if (delayedTasks.length > 0) {
        alerts.push({ type: "delayed", icon: "alert", color: "danger", title: "已延期任务", items: delayedTasks.map(t => t.name) });
      }

      return alerts;
    });

    // ==================== 搜索功能 (任务19) ====================

    const searchQuery = ref("");

    // ==================== 工期管理 ====================

    const scheduleFilter = ref("all");

    const filteredTasks = computed(() => {
      let result = tasks;
      if (scheduleFilter.value !== "all") {
        result = result.filter(t => getEffectiveStatus(t) === scheduleFilter.value);
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase();
        result = result.filter(t => t.name.toLowerCase().includes(q) || (t.stage && t.stage.toLowerCase().includes(q)));
      }
      return result;
    });

    const showTaskModal = ref(false);
    const editingTask = reactive({
      id: null, name: "", stage: "", startDate: "", endDate: "", status: "pending", progress: 0
    });

    function openTaskModal(task) {
      if (task) {
        Object.assign(editingTask, task);
      } else {
        Object.assign(editingTask, {
          id: null, name: "", stage: stages[0]?.name || "", startDate: todayStr(),
          endDate: todayStr(), status: "pending", progress: 0
        });
      }
      showTaskModal.value = true;
    }

    function saveTask() {
      if (!editingTask.name.trim()) {
        showToast("请输入任务名称");
        return;
      }
      if (editingTask.id) {
        const idx = tasks.findIndex(t => t.id === editingTask.id);
        if (idx > -1) {
          Object.assign(tasks[idx], JSON.parse(JSON.stringify(editingTask)));
          addLog("edit", "编辑任务：" + editingTask.name);
        }
      } else {
        const newTask = JSON.parse(JSON.stringify(editingTask));
        newTask.id = Date.now();
        tasks.push(newTask);
        addLog("add", "新增任务：" + editingTask.name);
      }
      showTaskModal.value = false;
      saveAll();
      showToast(editingTask.id ? "已更新" : "已添加");
    }

    function deleteTask(task) {
      if (!confirm("确认删除\"" + task.name + "\"？")) return;
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx > -1) tasks.splice(idx, 1);
      addLog("delete", "删除任务：" + task.name);
      saveAll();
      showToast("已删除");
    }

    function startTask(task) {
      task.status = "in-progress";
      task.progress = 10;
      addLog("start", "开始任务：" + task.name);
      saveAll();
      showToast("已开始");
    }

    function completeTask(task) {
      task.status = "completed";
      task.progress = 100;
      addLog("complete", "完成任务：" + task.name);
      saveAll();
      showToast("已完成");
    }

    // ==================== 预算管理 ====================

    const showExpenseModal = ref(false);
    const editingExpense = reactive({
      id: null, category: "", item: "", budgetAmount: 0, actualAmount: 0
    });

    function openExpenseModal(expense) {
      if (expense) {
        Object.assign(editingExpense, expense);
      } else {
        Object.assign(editingExpense, {
          id: null, category: categoryNames.value[0] || "其他",
          item: "", budgetAmount: 0, actualAmount: 0
        });
      }
      showExpenseModal.value = true;
    }

    function saveExpense() {
      if (!editingExpense.item.trim()) {
        showToast("请输入项目名称");
        return;
      }
      if (editingExpense.id) {
        const idx = budget.findIndex(b => b.id === editingExpense.id);
        if (idx > -1) {
          Object.assign(budget[idx], JSON.parse(JSON.stringify(editingExpense)));
          addLog("edit", "编辑支出项：" + editingExpense.item);
        }
      } else {
        const newExpense = JSON.parse(JSON.stringify(editingExpense));
        newExpense.id = Date.now();
        budget.push(newExpense);
        addLog("add", "新增支出项：" + editingExpense.item);
      }
      showExpenseModal.value = false;
      saveAll();
      showToast(editingExpense.id ? "已更新" : "已添加");
    }

    // 支出删除 (任务13)
    function deleteExpense(expense) {
      if (!confirm("确认删除\"" + expense.item + "\"？")) return;
      const idx = budget.findIndex(b => b.id === expense.id);
      if (idx > -1) {
        budget.splice(idx, 1);
        addLog("delete", "删除支出项：" + expense.item);
        saveAll();
        showToast("已删除");
      }
    }

    // ==================== 预算分类自定义 (任务22) ====================

    const showCategoryModal = ref(false);
    const newCategoryName = ref("");

    function openCategoryModal() {
      newCategoryName.value = "";
      showCategoryModal.value = true;
    }

    function addCategory() {
      const name = newCategoryName.value.trim();
      if (!name) {
        showToast("请输入分类名称");
        return;
      }
      if (categoryNames.value.includes(name)) {
        showToast("该分类已存在");
        return;
      }
      // 添加一个空项作为分类载体
      budget.push({
        id: Date.now(),
        category: name,
        item: name + "（待编辑）",
        budgetAmount: 0,
        actualAmount: 0
      });
      addLog("add", "新增分类：" + name);
      showCategoryModal.value = false;
      saveAll();
      showToast("分类已添加");
    }

    function deleteCategory(catName) {
      const count = budget.filter(b => b.category === catName).length;
      if (!confirm("删除分类\"" + catName + "\"及其下 " + count + " 个支出项？")) return;
      for (let i = budget.length - 1; i >= 0; i--) {
        if (budget[i].category === catName) budget.splice(i, 1);
      }
      addLog("delete", "删除分类：" + catName);
      saveAll();
      showToast("已删除分类");
    }

    // ==================== 项目编辑 ====================

    const showProjectModal = ref(false);
    const editingProject = reactive({
      name: "", address: "", startDate: "", endDate: "", totalBudget: 0
    });

    function openProjectModal() {
      Object.assign(editingProject, JSON.parse(JSON.stringify(project)));
      showProjectModal.value = true;
    }

    function saveProject() {
      Object.assign(project, JSON.parse(JSON.stringify(editingProject)));
      addLog("edit", "编辑项目信息");
      showProjectModal.value = false;
      saveAll();
      showToast("项目信息已保存");
    }

    // ==================== 总预算编辑 ====================

    const showBudgetEditModal = ref(false);
    const editingTotalBudget = ref(0);

    function openBudgetEditModal() {
      editingTotalBudget.value = project.totalBudget;
      showBudgetEditModal.value = true;
    }

    function saveTotalBudget() {
      project.totalBudget = editingTotalBudget.value;
      addLog("budget", "修改总预算：" + formatMoney(editingTotalBudget.value));
      showBudgetEditModal.value = false;
      saveAll();
      showToast("总预算已更新");
    }

    // ==================== 流程管理 ====================

    const showStageModal = ref(false);
    const editingStage = reactive({
      id: null, name: "", startDate: "", endDate: "", status: "pending", contractor: "", notes: ""
    });

    function openStageModal(stage) {
      Object.assign(editingStage, JSON.parse(JSON.stringify(stage)));
      showStageModal.value = true;
    }

    function openAddStageModal() {
      Object.assign(editingStage, {
        id: null, name: "", startDate: "", endDate: "", status: "pending", contractor: "", notes: ""
      });
      showStageModal.value = true;
    }

    function saveStage() {
      if (!editingStage.name.trim()) {
        showToast("请填写阶段名称");
        return;
      }
      if (editingStage.id) {
        const idx = stages.findIndex(s => s.id === editingStage.id);
        if (idx > -1) {
          const oldName = stages[idx].name;
          if (oldName !== editingStage.name) {
            tasks.forEach(t => { if (t.stage === oldName) t.stage = editingStage.name; });
            photos.forEach(p => { if (p.stage === oldName) p.stage = editingStage.name; });
          }
          Object.assign(stages[idx], JSON.parse(JSON.stringify(editingStage)));
          if (!stages[idx].acceptedItems) stages[idx].acceptedItems = [];
          addLog("edit", "编辑阶段：" + editingStage.name);
        }
      } else {
        const maxId = stages.length > 0 ? Math.max(...stages.map(s => s.id)) : 0;
        const newStage = Object.assign({}, JSON.parse(JSON.stringify(editingStage)), { id: maxId + 1, acceptedItems: [] });
        stages.push(newStage);
        addLog("add", "新增阶段：" + editingStage.name);
      }
      showStageModal.value = false;
      saveAll();
      showToast(editingStage.id ? "已保存" : "已添加");
    }

    function deleteStage(stage) {
      if (!confirm("确定删除\"" + stage.name + "\"吗？关联的任务不会删除，但会失去阶段归属。")) return;
      const idx = stages.findIndex(s => s.id === stage.id);
      if (idx > -1) {
        stages.splice(idx, 1);
        addLog("delete", "删除阶段：" + stage.name);
        saveAll();
        showToast("已删除");
      }
    }

    function startStage(stage) {
      stage.status = "in-progress";
      tasks.forEach(t => {
        if (t.stage === stage.name && t.status === "pending") {
          t.status = "in-progress";
          t.progress = 10;
        }
      });
      addLog("start", "开始阶段：" + stage.name);
      saveAll();
      showToast(stage.name + " 已开始");
    }

    function completeStage(stage) {
      stage.status = "completed";
      tasks.forEach(t => {
        if (t.stage === stage.name && t.status !== "completed") {
          t.status = "completed";
          t.progress = 100;
        }
      });
      addLog("complete", "完成阶段：" + stage.name);
      saveAll();
      showToast(stage.name + " 已完成");
    }

    // ==================== 阶段验收 (任务24) ====================

    function toggleAcceptance(stage, item) {
      if (!stage.acceptedItems) stage.acceptedItems = [];
      const idx = stage.acceptedItems.indexOf(item);
      if (idx > -1) {
        stage.acceptedItems.splice(idx, 1);
        addLog("acceptance", "取消验收：" + stage.name + " - " + item);
      } else {
        stage.acceptedItems.push(item);
        addLog("acceptance", "验收通过：" + stage.name + " - " + item);
      }
      saveAll();
    }

    function isAccepted(stage, item) {
      return stage.acceptedItems && stage.acceptedItems.includes(item);
    }

    function getAcceptanceProgress(stage) {
      const items = getAcceptanceItems(stage.name);
      if (items.length === 0) return 0;
      const accepted = stage.acceptedItems ? stage.acceptedItems.length : 0;
      return Math.round(accepted / items.length * 100);
    }

    // ==================== 流程拖拽排序 ====================

    const dragState = reactive({
      isDragging: false, dragOccurred: false, stageId: null,
      startIdx: -1, targetIdx: -1, startY: 0, offsetY: 0, timer: null
    });

    function onDragStart(e, stage, idx) {
      if (dragState.isDragging) return;
      dragState.stageId = stage.id;
      dragState.startIdx = idx;
      dragState.startY = e.touches[0].clientY;
      dragState.timer = setTimeout(() => {
        dragState.isDragging = true;
        dragState.dragOccurred = true;
        if (navigator.vibrate) navigator.vibrate(30);
      }, 500);
    }

    function onDragMove(e) {
      if (!dragState.isDragging) {
        if (dragState.timer && Math.abs(e.touches[0].clientY - dragState.startY) > 10) {
          clearTimeout(dragState.timer);
          dragState.timer = null;
        }
        return;
      }
      e.preventDefault();
      const touch = e.touches[0];
      dragState.offsetY = touch.clientY - dragState.startY;
      updateDragTarget(touch.clientY);
    }

    function onDragEnd() {
      if (dragState.timer) { clearTimeout(dragState.timer); dragState.timer = null; }
      if (dragState.isDragging) commitReorder();
      setTimeout(() => { dragState.dragOccurred = false; }, 200);
      dragState.isDragging = false;
      dragState.stageId = null;
      dragState.startIdx = -1;
      dragState.targetIdx = -1;
      dragState.offsetY = 0;
    }

    function onMouseDragStart(e, stage, idx) {
      e.preventDefault();
      dragState.stageId = stage.id;
      dragState.startIdx = idx;
      dragState.startY = e.clientY;
      dragState.isDragging = true;
      dragState.dragOccurred = true;
      const onMove = (ev) => {
        dragState.offsetY = ev.clientY - dragState.startY;
        updateDragTarget(ev.clientY);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        commitReorder();
        setTimeout(() => { dragState.dragOccurred = false; }, 200);
        dragState.isDragging = false;
        dragState.stageId = null;
        dragState.startIdx = -1;
        dragState.targetIdx = -1;
        dragState.offsetY = 0;
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }

    function updateDragTarget(clientY) {
      const cards = document.querySelectorAll("[data-drag-id]");
      let found = -1;
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (rect.height === 0) continue;
        const midY = rect.top + rect.height / 2;
        if (clientY < midY) { found = i; break; }
      }
      if (found === -1) found = cards.length - 1;
      if (found !== dragState.targetIdx) dragState.targetIdx = found;
    }

    function commitReorder() {
      if (dragState.targetIdx === -1 || dragState.targetIdx === dragState.startIdx) return;
      const moved = stages.splice(dragState.startIdx, 1)[0];
      let insertAt = dragState.targetIdx;
      if (insertAt > dragState.startIdx) insertAt--;
      stages.splice(insertAt, 0, moved);
      addLog("reorder", "调整阶段顺序");
      saveAll();
      showToast("顺序已更新");
    }

    function onStageClick(stage) {
      if (dragState.dragOccurred) return;
      openStageModal(stage);
    }

    // ==================== 工期任务拖拽排序 ====================

    const taskDragState = reactive({
      isDragging: false, dragOccurred: false, taskId: null,
      startIdx: -1, targetIdx: -1, startY: 0, offsetY: 0, timer: null
    });

    function onTaskDragStart(e, task, idx) {
      if (taskDragState.isDragging) return;
      if (scheduleFilter.value !== "all" || searchQuery.value.trim()) return;
      taskDragState.taskId = task.id;
      taskDragState.startIdx = idx;
      taskDragState.startY = e.touches[0].clientY;
      taskDragState.timer = setTimeout(() => {
        taskDragState.isDragging = true;
        taskDragState.dragOccurred = true;
        if (navigator.vibrate) navigator.vibrate(30);
      }, 500);
    }

    function onTaskDragMove(e) {
      if (!taskDragState.isDragging) {
        if (taskDragState.timer && Math.abs(e.touches[0].clientY - taskDragState.startY) > 10) {
          clearTimeout(taskDragState.timer);
          taskDragState.timer = null;
        }
        return;
      }
      e.preventDefault();
      const touch = e.touches[0];
      taskDragState.offsetY = touch.clientY - taskDragState.startY;
      updateTaskDragTarget(touch.clientY);
    }

    function onTaskDragEnd() {
      if (taskDragState.timer) { clearTimeout(taskDragState.timer); taskDragState.timer = null; }
      if (taskDragState.isDragging) commitTaskReorder();
      setTimeout(() => { taskDragState.dragOccurred = false; }, 200);
      taskDragState.isDragging = false;
      taskDragState.taskId = null;
      taskDragState.startIdx = -1;
      taskDragState.targetIdx = -1;
      taskDragState.offsetY = 0;
    }

    function onMouseTaskDragStart(e, task, idx) {
      e.preventDefault();
      taskDragState.taskId = task.id;
      taskDragState.startIdx = idx;
      taskDragState.startY = e.clientY;
      taskDragState.isDragging = true;
      taskDragState.dragOccurred = true;
      const onMove = (ev) => {
        taskDragState.offsetY = ev.clientY - taskDragState.startY;
        updateTaskDragTarget(ev.clientY);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        commitTaskReorder();
        setTimeout(() => { taskDragState.dragOccurred = false; }, 200);
        taskDragState.isDragging = false;
        taskDragState.taskId = null;
        taskDragState.startIdx = -1;
        taskDragState.targetIdx = -1;
        taskDragState.offsetY = 0;
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }

    function updateTaskDragTarget(clientY) {
      const cards = document.querySelectorAll("[data-task-drag-id]");
      let found = -1;
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (rect.height === 0) continue;
        const midY = rect.top + rect.height / 2;
        if (clientY < midY) { found = i; break; }
      }
      if (found === -1) found = cards.length - 1;
      if (found !== taskDragState.targetIdx) taskDragState.targetIdx = found;
    }

    function commitTaskReorder() {
      if (taskDragState.targetIdx === -1 || taskDragState.targetIdx === taskDragState.startIdx) return;
      const moved = tasks.splice(taskDragState.startIdx, 1)[0];
      let insertAt = taskDragState.targetIdx;
      if (insertAt > taskDragState.startIdx) insertAt--;
      tasks.splice(insertAt, 0, moved);
      addLog("reorder", "调整任务顺序");
      saveAll();
      showToast("顺序已更新");
    }

    function onTaskClick(task) {
      if (taskDragState.dragOccurred) return;
      openTaskModal(task);
    }

    // ==================== 现场照片 ====================

    const photoFilter = ref("all");
    const photoViewMode = ref("grid"); // grid | grouped
    const showPhotoDetail = ref(false);
    const showPhotoUpload = ref(false);
    const viewingPhoto = reactive({});
    const newPhoto = reactive({ url: "", stage: "", uploadBy: "", description: "" });
    const photoInput = ref(null);
    const batchPhotoQueue = ref([]);
    const batchPhotoIndex = ref(0);

    const filteredPhotos = computed(() => {
      if (photoFilter.value === "all") return photos;
      return photos.filter(p => p.stage === photoFilter.value);
    });

    // 照片按日期分组 (任务18)
    const groupedPhotos = computed(() => {
      const map = {};
      filteredPhotos.value.forEach(p => {
        const date = p.uploadDate || "未知日期";
        if (!map[date]) map[date] = { date: date, photos: [] };
        map[date].photos.push(p);
      });
      return Object.values(map).sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    function triggerPhotoUpload() {
      console.log("[照片] triggerPhotoUpload 被调用, photoInput:", photoInput.value);
      if (photoInput.value) {
        photoInput.value.click();
      } else {
        // fallback: 创建临时 input
        console.log("[照片] photoInput ref 为空，使用 fallback");
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.style.display = "none";
        input.onchange = function(e) { handlePhotoUpload(e); };
        document.body.appendChild(input);
        input.click();
        setTimeout(function() { document.body.removeChild(input); }, 1000);
      }
    }

    // 批量上传 (任务17)
    function handlePhotoUpload(e) {
      var files = Array.from(e.target.files);
      console.log("[照片] 选择文件:", files.length, "个");
      if (!files || files.length === 0) {
        console.log("[照片] 没有选择文件");
        return;
      }

      batchPhotoQueue.value = files;
      batchPhotoIndex.value = 0;

      // 处理第一张照片
      processNextBatchPhoto();
      e.target.value = "";
    }

    function processNextBatchPhoto() {
      if (batchPhotoIndex.value >= batchPhotoQueue.value.length) {
        showToast("已上传 " + batchPhotoQueue.value.length + " 张照片");
        batchPhotoQueue.value = [];
        batchPhotoIndex.value = 0;
        return;
      }

      const file = batchPhotoQueue.value[batchPhotoIndex.value];
      compressImage(file, (dataUrl) => {
        if (!dataUrl) {
          console.error("[照片] 压缩失败，跳过此张");
          showToast("照片处理失败，已跳过");
          skipPhoto();
          return;
        }
        const cs = currentStage.value;
        newPhoto.url = dataUrl;
        newPhoto.stage = cs ? cs.name : (stages[0] ? stages[0].name : "");
        newPhoto.uploadBy = "";
        newPhoto.description = "";
        showPhotoUpload.value = true;
        console.log("[照片] 上传弹窗已显示");
      });
    }

    function savePhoto() {
      if (!newPhoto.url) {
        showToast("请先选择照片");
        return;
      }
      if (!newPhoto.uploadBy.trim()) {
        showToast("请填写上传人");
        return;
      }
      try {
        const photo = {
          id: Date.now() + Math.random(),
          url: newPhoto.url,
          stage: newPhoto.stage,
          uploadBy: newPhoto.uploadBy,
          description: newPhoto.description,
          uploadDate: todayStr()
        };
        photos.push(photo);
        addLog("add", "上传照片：" + newPhoto.stage + (newPhoto.description ? " - " + newPhoto.description : ""));
        showPhotoUpload.value = false;

        var currentBatchIndex = batchPhotoIndex.value;

        // 重置
        newPhoto.url = "";
        newPhoto.uploadBy = "";
        newPhoto.description = "";

        saveAll();
        console.log("[照片] 保存成功");

        // 如果是批量上传，处理下一张
        if (batchPhotoQueue.value.length > 0 && currentBatchIndex < batchPhotoQueue.value.length - 1) {
          batchPhotoIndex.value = currentBatchIndex + 1;
          setTimeout(function() { processNextBatchPhoto(); }, 300);
        } else {
          showToast("上传成功");
          batchPhotoQueue.value = [];
          batchPhotoIndex.value = 0;
        }
      } catch (e) {
        console.error("[照片] 保存失败:", e);
        showToast("保存失败：" + (e.name === "QuotaExceededError" ? "存储空间不足" : e.message));
        // 回退：移除刚添加的照片
        if (photos.length > 0) photos.pop();
      }
    }

    function skipPhoto() {
      showPhotoUpload.value = false;
      if (batchPhotoIndex.value < batchPhotoQueue.value.length - 1) {
        batchPhotoIndex.value++;
        setTimeout(() => processNextBatchPhoto(), 200);
      } else {
        batchPhotoQueue.value = [];
        batchPhotoIndex.value = 0;
      }
    }

    function openPhotoDetail(photo) {
      Object.assign(viewingPhoto, JSON.parse(JSON.stringify(photo)));
      showPhotoDetail.value = true;
    }

    function savePhotoDescription() {
      const idx = photos.findIndex(p => p.id === viewingPhoto.id);
      if (idx > -1) {
        photos[idx].description = viewingPhoto.description;
        saveAll();
      }
    }

    function deletePhoto(photo) {
      if (!confirm("确认删除这张照片？")) return;
      const idx = photos.findIndex(p => p.id === photo.id);
      if (idx > -1) photos.splice(idx, 1);
      showPhotoDetail.value = false;
      addLog("delete", "删除照片");
      saveAll();
      showToast("已删除");
    }

    // ==================== 数据保存 ====================

    function saveAll(skipSync) {
      // 非阻塞：延迟到下一个事件循环，避免卡 UI
      var p = project, s = stages, t = tasks, b = budget, ph = photos, lg = logs;
      setTimeout(function() {
        try {
          // 直接序列化响应式对象（Vue3 Proxy 兼容 JSON.stringify）
          // 只做一次 stringify，不做 JSON.parse(JSON.stringify()) 深拷贝
          var data = {
            _version: DATA_VERSION,
            project: p,
            stages: s,
            tasks: t,
            budget: b,
            photos: ph,
            logs: lg
          };
          saveData(data);
        } catch (e) {
          console.error("[存储] saveAll 失败:", e);
        }
      }, 0);
      if (!skipSync) debouncedSync();
    }

    // ==================== MQTT 云同步 (任务15: 冲突处理) ====================

    const syncEnabled = ref(false);
    const lastSyncTime = ref(null);
    const isSyncing = ref(false);
    const syncStatus = ref("connecting");
    let mqttClient = null;
    let applyingServerData = false;
    let syncTimer = null;
    let lastPublishTime = 0;
    let localDataVersion = Date.now(); // 本地数据版本号

    const MQTT_CONFIG = {
      brokers: [
        "wss://broker-cn.emqx.io:8084/mqtt",
        "wss://broker.emqx.io:8084/mqtt",
        "wss://public.mqtthq.com:8883/mqtt"
      ],
      topic: "renovation-baige-fuzhou-2026/data",
      clientId: "baige_" + Math.random().toString(16).substr(2, 8)
    };

    const isEditing = computed(() => {
      return showTaskModal.value || showExpenseModal.value ||
             showStageModal.value || showPhotoDetail.value || showPhotoUpload.value ||
             showProjectModal.value || showBudgetEditModal.value || showCategoryModal.value ||
             showLogModal.value;
    });

    // 冲突处理：基于版本号合并数据
    function applyServerData(data) {
      if (!data) return;

      // 版本号对比：只有更新的数据才应用
      const serverVersion = data.timestamp || data._version || 0;
      if (serverVersion && serverVersion <= localDataVersion) {
        console.log("[MQTT] 服务器数据版本较旧，跳过");
        return;
      }

      applyingServerData = true;

      // 智能合并：保留本地正在编辑的数据
      if (data.project) {
        Object.keys(data.project).forEach(k => {
          if (!(isEditing.value && k === "totalBudget")) {
            project[k] = data.project[k];
          }
        });
      }

      if (data.stages) {
        // 合并策略：以服务器为准，但保留本地验收状态
        const localAcceptedMap = {};
        stages.forEach(s => {
          if (s.acceptedItems && s.acceptedItems.length > 0) {
            localAcceptedMap[s.id] = s.acceptedItems;
          }
        });
        data.stages.forEach(s => {
          if (localAcceptedMap[s.id] && (!s.acceptedItems || s.acceptedItems.length === 0)) {
            s.acceptedItems = localAcceptedMap[s.id];
          }
        });
        stages.splice(0, stages.length, ...data.stages);
      }

      if (data.tasks) tasks.splice(0, tasks.length, ...data.tasks);
      if (data.budget) budget.splice(0, budget.length, ...data.budget);

      // 照片合并：取并集，避免丢照片
      if (data.photos) {
        const localIds = new Set(photos.map(p => p.id));
        const newPhotos = data.photos.filter(p => !localIds.has(p.id));
        if (newPhotos.length > 0) {
          photos.splice(0, photos.length, ...data.photos);
        }
      }

      // 日志合并
      if (data.logs) {
        const localLogIds = new Set(logs.map(l => l.id));
        const newLogs = data.logs.filter(l => !localLogIds.has(l.id));
        if (newLogs.length > 0) {
          logs.splice(0, logs.length, ...data.logs);
          logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          if (logs.length > 200) logs.splice(200);
        }
      }

      localDataVersion = serverVersion || Date.now();
      lastSyncTime.value = new Date();
      saveAll(true);
      nextTick(() => { applyingServerData = false; });
    }

    function publishData() {
      if (!mqttClient || !mqttClient.connected) return;
      if (applyingServerData) return;
      if (isEditing.value) return;

      localDataVersion = Date.now();

      try {
        // 直接从响应式对象构建数据，只做一次 stringify
        var data = {
          project: project,
          stages: stages,
          tasks: tasks,
          budget: budget,
          photos: [],
          logs: logs.slice(0, 100),
          timestamp: localDataVersion
        };

        var msg = JSON.stringify(data);

        // 如果轻量数据小于 200KB 且有照片，尝试带上照片
        if (photos.length > 0 && msg.length < 200 * 1024) {
          // 先检查照片数据大小
          var photosJson;
          try {
            photosJson = JSON.stringify(photos);
          } catch(e) {
            // 序列化失败，只同步元数据
            photosJson = JSON.stringify(photos.map(function(p) {
              return { id: p.id, stage: p.stage, uploadBy: p.uploadBy,
                       description: p.description, uploadDate: p.uploadDate, url: "" };
            }));
            console.log("[MQTT] 照片序列化降级为元数据");
          }

          if (msg.length + photosJson.length < 500 * 1024) {
            // 重建完整消息（只做一次 stringify）
            data.photos = JSON.parse(photosJson);
            msg = JSON.stringify(data);
          } else {
            // 照片太大，只同步元数据
            data.photos = photos.map(function(p) {
              return { id: p.id, stage: p.stage, uploadBy: p.uploadBy,
                       description: p.description, uploadDate: p.uploadDate, url: "" };
            });
            msg = JSON.stringify(data);
            console.log("[MQTT] 数据较大，仅同步元数据");
          }
        }

        mqttClient.publish(MQTT_CONFIG.topic, msg, { qos: 0, retain: true });
        lastPublishTime = localDataVersion;
        lastSyncTime.value = new Date();
        syncStatus.value = "online";
      } catch (e) {
        console.log("[MQTT] 发布失败:", e);
      }
    }

    function debouncedSync() {
      if (applyingServerData) return;
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(() => publishData(), 1500);
    }

    let brokerIndex = 0;
    let connectTimeoutTimer = null;

    function tryConnectBroker() {
      if (brokerIndex >= MQTT_CONFIG.brokers.length) {
        console.log("[MQTT] 所有服务器均不可用");
        syncStatus.value = "offline";
        return;
      }

      const brokerUrl = MQTT_CONFIG.brokers[brokerIndex];
      console.log("[MQTT] 尝试连接:", brokerUrl);
      syncStatus.value = "connecting";

      if (mqttClient) {
        try { mqttClient.end(true); } catch(e) {}
        mqttClient = null;
      }

      try {
        mqttClient = mqtt.connect(brokerUrl, {
          clientId: MQTT_CONFIG.clientId + "_" + brokerIndex,
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 0
        });

        mqttClient.on("connect", () => {
          console.log("[MQTT] 已连接:", brokerUrl);
          if (connectTimeoutTimer) { clearTimeout(connectTimeoutTimer); connectTimeoutTimer = null; }
          syncEnabled.value = true;
          syncStatus.value = "online";
          mqttClient.subscribe(MQTT_CONFIG.topic, { qos: 0 });
        });

        mqttClient.on("message", (topic, message) => {
          if (applyingServerData || topic !== MQTT_CONFIG.topic) return;
          try {
            const data = JSON.parse(message.toString());
            if (data.timestamp && data.timestamp > lastPublishTime) {
              console.log("[MQTT] 收到更新");
              applyServerData(data);
            } else if (!lastPublishTime) {
              console.log("[MQTT] 收到初始数据");
              applyServerData(data);
              lastPublishTime = data.timestamp || 0;
            }
          } catch (e) {
            console.log("[MQTT] 解析失败:", e);
          }
        });

        mqttClient.on("error", (err) => {
          console.log("[MQTT] 连接错误:", brokerUrl, err.message);
        });

        mqttClient.on("close", () => {
          if (syncStatus.value === "online") {
            console.log("[MQTT] 连接断开，尝试重连");
            syncStatus.value = "connecting";
            setTimeout(() => {
              if (syncStatus.value !== "online" && mqttClient) {
                try { mqttClient.end(true); } catch(e) {}
                reconnectCurrent();
              }
            }, 2000);
          }
        });

        connectTimeoutTimer = setTimeout(() => {
          if (syncStatus.value === "connecting") {
            console.log("[MQTT] 超时，切换下一个服务器");
            brokerIndex++;
            tryConnectBroker();
          }
        }, 6000);

      } catch (e) {
        console.log("[MQTT] 异常:", e);
        brokerIndex++;
        tryConnectBroker();
      }
    }

    function reconnectCurrent() {
      const brokerUrl = MQTT_CONFIG.brokers[brokerIndex];
      console.log("[MQTT] 重连:", brokerUrl);
      try {
        mqttClient = mqtt.connect(brokerUrl, {
          clientId: MQTT_CONFIG.clientId + "_" + brokerIndex + "_" + Date.now(),
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 0
        });

        mqttClient.on("connect", () => {
          console.log("[MQTT] 重连成功:", brokerUrl);
          syncEnabled.value = true;
          syncStatus.value = "online";
          mqttClient.subscribe(MQTT_CONFIG.topic, { qos: 0 });
        });

        mqttClient.on("message", (topic, message) => {
          if (applyingServerData || topic !== MQTT_CONFIG.topic) return;
          try {
            const data = JSON.parse(message.toString());
            if (data.timestamp && data.timestamp > lastPublishTime) {
              applyServerData(data);
            } else if (!lastPublishTime) {
              applyServerData(data);
              lastPublishTime = data.timestamp || 0;
            }
          } catch (e) {}
        });

        mqttClient.on("error", () => {
          console.log("[MQTT] 重连失败，切换服务器");
          brokerIndex = (brokerIndex + 1) % MQTT_CONFIG.brokers.length;
          setTimeout(() => tryConnectBroker(), 1000);
        });

        connectTimeoutTimer = setTimeout(() => {
          if (syncStatus.value === "connecting") {
            console.log("[MQTT] 重连超时，切换服务器");
            brokerIndex = (brokerIndex + 1) % MQTT_CONFIG.brokers.length;
            tryConnectBroker();
          }
        }, 6000);

      } catch (e) {
        brokerIndex = (brokerIndex + 1) % MQTT_CONFIG.brokers.length;
        setTimeout(() => tryConnectBroker(), 1000);
      }
    }

    function initMQTT() {
      if (typeof mqtt === "undefined") {
        console.log("[MQTT] 库未加载，使用本地模式");
        syncStatus.value = "offline";
        return;
      }
      tryConnectBroker();
      setTimeout(() => {
        if (syncStatus.value === "connecting") {
          syncStatus.value = "offline";
          console.log("[MQTT] 总超时，使用本地模式");
        }
      }, 30000);
    }

    function retryConnect() {
      console.log("[MQTT] 手动重试连接");
      if (mqttClient) {
        try { mqttClient.end(true); } catch(e) {}
        mqttClient = null;
      }
      brokerIndex = 0;
      syncStatus.value = "connecting";
      showToast("正在重新连接...");
      tryConnectBroker();
    }

    // ==================== 数据导出/导入 ====================

    function exportData() {
      var data = {
        project: project,
        stages: stages,
        tasks: tasks,
        budget: budget,
        photos: photos,
        logs: logs,
        exportDate: new Date().toISOString()
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "装修数据_" + todayStr() + ".json";
      a.click();
      URL.revokeObjectURL(url);
      addLog("sync", "导出数据");
      showToast("数据已导出");
    }

    function importData(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!confirm("导入将覆盖当前数据，确认继续？")) { e.target.value = ""; return; }
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const data = JSON.parse(event.target.result);
          applyingServerData = true;
          if (data.project) Object.assign(project, data.project);
          if (data.stages) stages.splice(0, stages.length, ...data.stages);
          if (data.tasks) tasks.splice(0, tasks.length, ...data.tasks);
          if (data.budget) budget.splice(0, budget.length, ...data.budget);
          if (data.photos) photos.splice(0, photos.length, ...data.photos);
          if (data.logs) logs.splice(0, logs.length, ...data.logs);
          nextTick(() => {
            applyingServerData = false;
            saveAll();
            publishData();
          });
          addLog("sync", "导入数据");
          showToast("导入成功");
        } catch (err) {
          showToast("导入失败：格式错误");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }

    // ---- 自动保存已移至各操作函数中手动调用 saveAll() ----
    // 不再使用 deep watch，避免遍历大型 base64 字符串导致卡死

    // ---- 启动 ----
    onMounted(() => {
      checkDelayed();
      initMQTT();
      // 每分钟检查一次延期
      setInterval(checkDelayed, 60000);
    });

    // ==================== 返回 ====================

    return {
      // 数据
      project, stages, tasks, budget, photos, logs,
      currentTab, tabs, navTitle, currentTime,
      progressRingSize, progressRingRadius, ringCircumference,
      isDesktop,
      // 筛选+搜索
      scheduleFilter, filteredTasks, searchQuery,
      photoFilter, filteredPhotos, photoViewMode,
      // 弹窗状态
      showTaskModal, editingTask,
      showExpenseModal, editingExpense,
      showProjectModal, editingProject, openProjectModal, saveProject,
      showBudgetEditModal, editingTotalBudget, openBudgetEditModal, saveTotalBudget,
      showStageModal, editingStage, openAddStageModal, deleteStage,
      showPhotoDetail, viewingPhoto,
      showPhotoUpload, newPhoto, photoInput,
      showLogModal, showCategoryModal, newCategoryName,
      toastMessage,
      // 计算属性
      overallProgress, daysElapsed, daysRemaining, completedStages,
      delayedCount,
      currentStage, totalSpent, remainingBudget, budgetProgress,
      totalAllocatedBudget,
      budgetCategories, categoryNames, recentPhotos, upcomingTasks,
      todayAlerts, stageBudgets, groupedPhotos,
      // 方法
      statusText, formatMoney, formatLogAction,
      openTaskModal, saveTask, deleteTask, startTask, completeTask,
      openExpenseModal, saveExpense, deleteExpense,
      openCategoryModal, addCategory, deleteCategory,
      openStageModal, saveStage, startStage, completeStage,
      triggerPhotoUpload, handlePhotoUpload, savePhoto, skipPhoto,
      openPhotoDetail, savePhotoDescription, deletePhoto,
      showToast,
      // 验收
      getAcceptanceItems, toggleAcceptance, isAccepted, getAcceptanceProgress,
      getStageBudget,
      // 同步状态
      syncStatus, lastSyncTime, isSyncing, retryConnect,
      // 导出导入
      exportData, importData,
      // 拖拽排序 - 流程
      dragState, onDragStart, onDragMove, onDragEnd,
      onMouseDragStart, onStageClick,
      // 拖拽排序 - 工期
      taskDragState, onTaskDragStart, onTaskDragMove, onTaskDragEnd,
      onMouseTaskDragStart, onTaskClick,
      // 延期
      getEffectiveStatus, isOverdue
    };
  }
});

__vueApp.config.errorHandler = function(err, instance, info) {
  console.error('[Vue错误]', err, info);
  if (window.__showError) {
    window.__showError('Vue渲染错误: ' + (err && err.message ? err.message : String(err)) + ' | ' + info);
  }
};
__vueApp.mount("#app");

