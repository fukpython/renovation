/**
 * 装修管家 - Vue 3 应用
 * 白哥家装修进度管理工具
 */

const { createApp, ref, reactive, computed, onMounted, watch, nextTick } = Vue;

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
    { id: 1, name: "设计确认", startDate: "2026-08-10", endDate: "2026-08-15", status: "pending", contractor: "", notes: "" },
    { id: 2, name: "主体拆改", startDate: "2026-08-16", endDate: "2026-08-22", status: "pending", contractor: "", notes: "" },
    { id: 3, name: "阳台封窗", startDate: "2026-08-23", endDate: "2026-08-30", status: "pending", contractor: "", notes: "" },
    { id: 4, name: "水电改造", startDate: "2026-08-31", endDate: "2026-09-10", status: "pending", contractor: "", notes: "" },
    { id: 5, name: "泥瓦工程", startDate: "2026-09-11", endDate: "2026-09-30", status: "pending", contractor: "", notes: "" },
    { id: 6, name: "木工工程", startDate: "2026-10-01", endDate: "2026-10-15", status: "pending", contractor: "", notes: "" },
    { id: 7, name: "油漆工程", startDate: "2026-10-16", endDate: "2026-11-05", status: "pending", contractor: "", notes: "" },
    { id: 8, name: "全屋定制", startDate: "2026-11-06", endDate: "2026-11-20", status: "pending", contractor: "", notes: "" },
    { id: 9, name: "安装工程", startDate: "2026-11-21", endDate: "2026-12-05", status: "pending", contractor: "", notes: "" },
    { id: 10, name: "软装入住", startDate: "2026-12-06", endDate: "2026-12-20", status: "pending", contractor: "", notes: "" }
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
  photos: []
};

/* ===================== 数据持久化 ===================== */

const STORAGE_KEY = "renovation_app_data";
const DATA_VERSION = 2; // v2: 新增阳台封窗、全屋定制阶段

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const version = parsed._version || 1;

      // 合并默认数据，防止字段缺失
      const merged = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_DATA)), parsed);

      // v1 → v2 迁移：插入新阶段
      if (version < 2) {
        const newStageNames = ["阳台封窗", "全屋定制"];
        const existingNames = (merged.stages || []).map(s => s.name);
        const defaultStages = DEFAULT_DATA.stages;

        // 按默认顺序重建 stages 数组
        const reordered = [];
        for (const ds of defaultStages) {
          if (existingNames.includes(ds.name)) {
            // 用已有的数据
            const existing = merged.stages.find(s => s.name === ds.name);
            reordered.push(existing);
          } else {
            // 新阶段，用默认数据
            reordered.push(JSON.parse(JSON.stringify(ds)));
          }
        }
        merged.stages = reordered;

        // 合并新预算项
        const existingBudgetItems = (merged.budget || []).map(b => b.item);
        for (const db of DEFAULT_DATA.budget) {
          if (!existingBudgetItems.includes(db.item)) {
            merged.budget.push(JSON.parse(JSON.stringify(db)));
          }
        }

        // 合并新任务
        const existingTaskNames = (merged.tasks || []).map(t => t.name);
        for (const dt of DEFAULT_DATA.tasks) {
          if (!existingTaskNames.includes(dt.name)) {
            merged.tasks.push(JSON.parse(JSON.stringify(dt)));
          }
        }

        merged._version = DATA_VERSION;
        // 保存迁移后的数据
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        console.log("[迁移] 数据已从 v1 升级到 v2");
      }

      return merged;
    }
  } catch (e) {
    console.error("加载数据失败:", e);
  }
  const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
  fresh._version = DATA_VERSION;
  return fresh;
}

function saveData(data) {
  try {
    data._version = DATA_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("保存数据失败:", e);
    if (e.name === "QuotaExceededError") {
      showToast("存储空间不足，照片可能过多");
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

/* ===================== Vue 应用 ===================== */

createApp({
  setup() {
    // ---- 加载数据 ----
    const savedData = loadData();
    const project = reactive(savedData.project);
    const stages = reactive(savedData.stages);
    const tasks = reactive(savedData.tasks);
    const budget = reactive(savedData.budget);
    const photos = reactive(savedData.photos);

    // ---- 当前页签 ----
    const currentTab = ref("dashboard");
    const tabs = [
      { id: "dashboard", label: "首页", svg: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>' },
      { id: "schedule", label: "工期", svg: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>' },
      { id: "budget", label: "预算", svg: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>' },
      { id: "process", label: "流程", svg: '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/>' },
      { id: "photos", label: "现场", svg: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>' }
    ];

    // ---- 导航标题 ----
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

    // ==================== 计算属性 ====================

    // ---- 总进度（基于阶段完成情况）----
    const overallProgress = computed(() => {
      if (stages.length === 0) return 0;
      const completed = stages.filter(s => s.status === "completed").length;
      const inProgress = stages.filter(s => s.status === "in-progress").length;
      return Math.round((completed + inProgress * 0.5) / stages.length * 100);
    });

    // ---- 已施工天数 ----
    const daysElapsed = computed(() => {
      const today = new Date(todayStr());
      const start = new Date(project.startDate);
      if (today < start) return 0;
      return Math.max(0, daysBetween(project.startDate, todayStr()));
    });

    // ---- 剩余天数 ----
    const daysRemaining = computed(() => {
      const today = new Date(todayStr());
      const end = new Date(project.endDate);
      if (today > end) return 0;
      return Math.max(0, daysBetween(todayStr(), project.endDate));
    });

    // ---- 已完成阶段数 ----
    const completedStages = computed(() => {
      return stages.filter(s => s.status === "completed").length;
    });

    // ---- 当前阶段（第一个非完成阶段）----
    const currentStage = computed(() => {
      return stages.find(s => s.status === "in-progress") ||
             stages.find(s => s.status === "pending") ||
             null;
    });

    // ---- 预算计算 ----
    const totalSpent = computed(() => {
      return budget.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
    });

    const remainingBudget = computed(() => {
      return project.totalBudget - totalSpent.value;
    });

    const budgetProgress = computed(() => {
      if (project.totalBudget === 0) return 0;
      return (totalSpent.value / project.totalBudget) * 100;
    });

    // ---- 预算分类汇总 ----
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

    const categoryNames = computed(() => {
      return [...new Set(budget.map(item => item.category))];
    });

    // ---- 最近照片 ----
    const recentPhotos = computed(() => {
      return [...photos]
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 3);
    });

    // ---- 待办任务（待开始 + 进行中，取前5个）----
    const upcomingTasks = computed(() => {
      return tasks
        .filter(t => t.status === "pending" || t.status === "in-progress")
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);
    });

    // ==================== 工期管理 ====================

    const scheduleFilter = ref("all");

    const filteredTasks = computed(() => {
      if (scheduleFilter.value === "all") return tasks;
      return tasks.filter(t => t.status === scheduleFilter.value);
    });

    // 任务弹窗
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
        }
      } else {
        const newTask = JSON.parse(JSON.stringify(editingTask));
        newTask.id = Date.now();
        tasks.push(newTask);
      }
      showTaskModal.value = false;
      saveAll();
      showToast(editingTask.id ? "已更新" : "已添加");
    }

    function deleteTask(task) {
      if (!confirm(`确认删除"${task.name}"？`)) return;
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx > -1) tasks.splice(idx, 1);
      saveAll();
      showToast("已删除");
    }

    function startTask(task) {
      task.status = "in-progress";
      task.progress = 10;
      saveAll();
      showToast("已开始");
    }

    function completeTask(task) {
      task.status = "completed";
      task.progress = 100;
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
        }
      } else {
        const newExpense = JSON.parse(JSON.stringify(editingExpense));
        newExpense.id = Date.now();
        budget.push(newExpense);
      }
      showExpenseModal.value = false;
      saveAll();
      showToast(editingExpense.id ? "已更新" : "已添加");
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
      showProjectModal.value = false;
      saveAll();
      showToast("项目信息已保存");
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
        // 编辑已有阶段
        const idx = stages.findIndex(s => s.id === editingStage.id);
        if (idx > -1) {
          // 如果改了名字，同步更新任务和照片中的阶段名
          const oldName = stages[idx].name;
          if (oldName !== editingStage.name) {
            tasks.forEach(t => { if (t.stage === oldName) t.stage = editingStage.name; });
            photos.forEach(p => { if (p.stage === oldName) p.stage = editingStage.name; });
          }
          Object.assign(stages[idx], JSON.parse(JSON.stringify(editingStage)));
        }
      } else {
        // 新增阶段
        const maxId = stages.length > 0 ? Math.max(...stages.map(s => s.id)) : 0;
        stages.push(Object.assign({}, JSON.parse(JSON.stringify(editingStage)), { id: maxId + 1 }));
      }
      showStageModal.value = false;
      saveAll();
      showToast(editingStage.id ? "已保存" : "已添加");
    }

    function deleteStage(stage) {
      if (!confirm(`确定删除「${stage.name}」吗？关联的任务不会删除，但会失去阶段归属。`)) return;
      const idx = stages.findIndex(s => s.id === stage.id);
      if (idx > -1) {
        stages.splice(idx, 1);
        saveAll();
        showToast("已删除");
      }
    }

    function startStage(stage) {
      stage.status = "in-progress";
      // 自动将任务状态也更新
      tasks.forEach(t => {
        if (t.stage === stage.name && t.status === "pending") {
          t.status = "in-progress";
          t.progress = 10;
        }
      });
      saveAll();
      showToast(`${stage.name} 已开始`);
    }

    function completeStage(stage) {
      stage.status = "completed";
      // 自动完成任务
      tasks.forEach(t => {
        if (t.stage === stage.name && t.status !== "completed") {
          t.status = "completed";
          t.progress = 100;
        }
      });
      saveAll();
      showToast(`${stage.name} 已完成`);
    }

    // ==================== 现场照片 ====================

    const photoFilter = ref("all");
    const showPhotoDetail = ref(false);
    const showPhotoUpload = ref(false);
    const viewingPhoto = reactive({});
    const newPhoto = reactive({ url: "", stage: "", uploadBy: "", description: "" });
    const photoInput = ref(null);

    const filteredPhotos = computed(() => {
      if (photoFilter.value === "all") return photos;
      return photos.filter(p => p.stage === photoFilter.value);
    });

    function triggerPhotoUpload() {
      photoInput.value?.click();
    }

    function handlePhotoUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      // 压缩图片
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement("canvas");
          const maxW = 600, maxH = 450;
          let w = img.width, h = img.height;
          if (w > maxW) { h = h * maxW / w; w = maxW; }
          if (h > maxH) { w = w * maxH / h; h = maxH; }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          newPhoto.url = canvas.toDataURL("image/jpeg", 0.5);

          // 默认填充
          const cs = currentStage.value;
          newPhoto.stage = cs ? cs.name : (stages[0]?.name || "");
          newPhoto.uploadBy = "";
          newPhoto.description = "";

          showPhotoUpload.value = true;
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);

      // 清空 input 以便重复选择同一文件
      e.target.value = "";
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
      const photo = {
        id: Date.now(),
        url: newPhoto.url,
        stage: newPhoto.stage,
        uploadBy: newPhoto.uploadBy,
        description: newPhoto.description,
        uploadDate: todayStr()
      };
      photos.push(photo);
      showPhotoUpload.value = false;

      // 重置
      newPhoto.url = "";
      newPhoto.uploadBy = "";
      newPhoto.description = "";

      saveAll();
      showToast("上传成功");
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
      saveAll();
      showToast("已删除");
    }

    // ==================== 数据保存 ====================

    function saveAll() {
      const data = {
        project: JSON.parse(JSON.stringify(project)),
        stages: JSON.parse(JSON.stringify(stages)),
        tasks: JSON.parse(JSON.stringify(tasks)),
        budget: JSON.parse(JSON.stringify(budget)),
        photos: JSON.parse(JSON.stringify(photos))
      };
      saveData(data); // localStorage 备份
    }

    // ==================== MQTT 云同步 ====================

    const syncEnabled = ref(false);
    const lastSyncTime = ref(null);
    const isSyncing = ref(false);
    const syncStatus = ref("connecting"); // connecting | online | offline
    let mqttClient = null;
    let applyingServerData = false;
    let syncTimer = null;
    let lastPublishTime = 0;

    const MQTT_CONFIG = {
      brokers: [
        "wss://broker-cn.emqx.io:8084/mqtt",
        "wss://broker.emqx.io:8084/mqtt",
        "wss://public.mqtthq.com:8883/mqtt"
      ],
      topic: "renovation-baige-fuzhou-2026/data",
      clientId: "baige_" + Math.random().toString(16).substr(2, 8)
    };

    // 检查是否正在编辑
    const isEditing = computed(() => {
      return showTaskModal.value || showExpenseModal.value ||
             showStageModal.value || showPhotoDetail.value || showPhotoUpload.value;
    });

    // 应用云端数据到本地
    function applyServerData(data) {
      if (!data) return;
      applyingServerData = true;
      if (data.project) Object.assign(project, data.project);
      if (data.stages) stages.splice(0, stages.length, ...data.stages);
      if (data.tasks) tasks.splice(0, tasks.length, ...data.tasks);
      if (data.budget) budget.splice(0, budget.length, ...data.budget);
      if (data.photos) photos.splice(0, photos.length, ...data.photos);
      lastSyncTime.value = new Date();
      saveAll();
      nextTick(() => { applyingServerData = false; });
    }

    // 发布数据到 MQTT
    function publishData() {
      if (!mqttClient || !mqttClient.connected) return;
      if (applyingServerData) return;

      const data = {
        project: JSON.parse(JSON.stringify(project)),
        stages: JSON.parse(JSON.stringify(stages)),
        tasks: JSON.parse(JSON.stringify(tasks)),
        budget: JSON.parse(JSON.stringify(budget)),
        photos: JSON.parse(JSON.stringify(photos)),
        timestamp: Date.now()
      };

      try {
        const msg = JSON.stringify(data);
        // 消息过大时只同步文本数据（不含照片）
        if (msg.length > 3 * 1024 * 1024) {
          console.log("[MQTT] 数据较大，仅同步文本数据");
          const lightData = Object.assign({}, data, { photos: [] });
          mqttClient.publish(MQTT_CONFIG.topic, JSON.stringify(lightData), { qos: 0, retain: true });
        } else {
          mqttClient.publish(MQTT_CONFIG.topic, msg, { qos: 0, retain: true });
        }
        lastPublishTime = Date.now();
        lastSyncTime.value = new Date();
        syncStatus.value = "online";
      } catch (e) {
        console.log("[MQTT] 发布失败:", e);
      }
    }

    // 防抖同步
    function debouncedSync() {
      if (applyingServerData) return;
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(() => publishData(), 1500);
    }

    // 初始化 MQTT — 多服务器自动切换
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

      // 清理旧连接
      if (mqttClient) {
        try { mqttClient.end(true); } catch(e) {}
        mqttClient = null;
      }

      try {
        mqttClient = mqtt.connect(brokerUrl, {
          clientId: MQTT_CONFIG.clientId + "_" + brokerIndex,
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 0  // 关闭自动重连，手动切换服务器
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
            console.log("[MQTT] 连接断开，尝试重连当前服务器");
            syncStatus.value = "connecting";
            // 重连当前服务器
            setTimeout(() => {
              if (syncStatus.value !== "online" && mqttClient) {
                try { mqttClient.end(true); } catch(e) {}
                // 尝试重连当前 broker，失败则切换到下一个
                brokerIndex = Math.max(0, brokerIndex); // 保持当前 index
                reconnectCurrent();
              }
            }, 2000);
          }
        });

        // 6秒超时，切换到下一个服务器
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

    // 重连当前 broker
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

      // 总超时：30秒后如果还连不上，标记离线
      setTimeout(() => {
        if (syncStatus.value === "connecting") {
          syncStatus.value = "offline";
          console.log("[MQTT] 总超时，使用本地模式");
        }
      }, 30000);
    }

    // 手动重试连接
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
      const data = {
        project: JSON.parse(JSON.stringify(project)),
        stages: JSON.parse(JSON.stringify(stages)),
        tasks: JSON.parse(JSON.stringify(tasks)),
        budget: JSON.parse(JSON.stringify(budget)),
        photos: JSON.parse(JSON.stringify(photos)),
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "装修数据_" + todayStr() + ".json";
      a.click();
      URL.revokeObjectURL(url);
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
          nextTick(() => {
            applyingServerData = false;
            saveAll();
            publishData();
          });
          showToast("导入成功");
        } catch (err) {
          showToast("导入失败：格式错误");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }

    // ---- 自动保存（数据变化时）----
    watch([project, stages, tasks, budget, photos], () => {
      saveAll();
      debouncedSync();
    }, { deep: true });

    // ---- 启动同步 ----
    onMounted(() => {
      initMQTT();
    });

    // ==================== 返回 ====================

    return {
      // 数据
      project, stages, tasks, budget, photos,
      currentTab, tabs, navTitle, currentTime,
      // 筛选
      scheduleFilter, filteredTasks, photoFilter, filteredPhotos,
      // 弹窗状态
      showTaskModal, editingTask,
      showExpenseModal, editingExpense,
      showProjectModal, editingProject, openProjectModal, saveProject,
      showStageModal, editingStage, openAddStageModal, deleteStage,
      showPhotoDetail, viewingPhoto,
      showPhotoUpload, newPhoto, photoInput,
      toastMessage,
      // 计算属性
      overallProgress, daysElapsed, daysRemaining, completedStages,
      currentStage, totalSpent, remainingBudget, budgetProgress,
      budgetCategories, categoryNames, recentPhotos, upcomingTasks,
      // 方法
      statusText, formatMoney,
      openTaskModal, saveTask, deleteTask, startTask, completeTask,
      openExpenseModal, saveExpense,
      openStageModal, saveStage, startStage, completeStage,
      triggerPhotoUpload, handlePhotoUpload, savePhoto,
      openPhotoDetail, savePhotoDescription, deletePhoto,
      showToast,
      // 同步状态
      syncStatus, lastSyncTime, isSyncing, retryConnect,
      // 导出导入
      exportData, importData
    };
  }
}).mount("#app");
