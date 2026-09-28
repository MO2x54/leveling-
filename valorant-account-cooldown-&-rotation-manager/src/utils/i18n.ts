export type Language = 'en' | 'ar';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  privateEdition: string;
  owner: string;
  changeOwnerName: string;
  enterOwnerName: string;
  soundOn: string;
  soundOff: string;
  bulkAdd: string;
  bulkAddSubtitle: string;
  addAccount: string;
  editAccount: string;
  createAccount: string;
  saveChanges: string;
  cancel: string;
  allAccounts: string;
  readyToPlay: string;
  onCooldown: string;
  totalRotation: string;
  searchPlaceholder: string;
  filterAll: string;
  filterReady: string;
  filterCooldown: string;
  filterAllRegions: string;
  quickCheckmarkTip: string;
  quickCheckmarkTipDesc: string;
  rotationLock: string;
  noAccountsFound: string;
  noAccountsFilterDesc: string;
  noAccountsEmptyDesc: string;
  addFirstAccount: string;
  copyUser: string;
  copyPass: string;
  copied: string;
  start19h: string;
  resetTimer: string;
  readyStatus: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  level: string;
  rankedReady: string;
  levelsRemaining: string;
  username: string;
  password: string;
  region: string;
  durationHours: string;
  notes: string;
  notesPlaceholder: string;
  startTimerNow: string;
  accountNameReq: string;
  usernameReq: string;
  prefixName: string;
  startingLevel: string;
  sharedNotes: string;
  bulkUsernamesLabel: string;
  bulkUsernamesPlaceholder: string;
  bulkNotice: string;
  bulkSubmitBtn: string;
  autoFillPass: string;
  startAllReady: string;
  deleteAll: string;
  allRightsReserved: string;
  switchLanguage: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'VALO.LEVELING',
    appSubtitle: '19H Cooldown Engine',
    privateEdition: 'PRIVATE',
    owner: 'MO2A',
    changeOwnerName: 'Change Name Watermark',
    enterOwnerName: 'Enter owner name for watermark:',
    soundOn: 'Mute Audio FX',
    soundOff: 'Enable Audio FX',
    bulkAdd: 'Bulk Add (Shared Pass)',
    bulkAddSubtitle: 'Add multiple accounts with unified password',
    addAccount: 'Add Account',
    editAccount: 'Edit Valorant Account',
    createAccount: 'Create Account',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    allAccounts: 'All Accounts',
    readyToPlay: 'Ready to Play',
    onCooldown: 'On Cooldown',
    totalRotation: 'Rotation Pool',
    searchPlaceholder: 'Search by account name, username, region or notes...',
    filterAll: 'All Accounts',
    filterReady: 'Ready',
    filterCooldown: 'Cooldown',
    filterAllRegions: 'All Regions',
    quickCheckmarkTip: 'QUICK ROTATION TRIGGER',
    quickCheckmarkTipDesc: 'Click the checkbox (✔) next to any account to lock in the 19-hour cooldown countdown immediately!',
    rotationLock: '19H Mission Lock',
    noAccountsFound: 'No Accounts Found',
    noAccountsFilterDesc: 'No accounts match the current filter criteria. Try clearing search or filters.',
    noAccountsEmptyDesc: 'Start by adding your Valorant smurf or leveling accounts to track 19-hour mission resets.',
    addFirstAccount: 'Add First Account',
    copyUser: 'Copy User',
    copyPass: 'Copy Pass',
    copied: 'Copied!',
    start19h: 'START 19H',
    resetTimer: 'RESET TIMER',
    readyStatus: 'READY TO PLAY',
    edit: 'Edit Account',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this account?',
    level: 'Level',
    rankedReady: 'Ranked Ready 🏆',
    levelsRemaining: 'levels to Ranked',
    username: 'Riot Username / ID',
    password: 'Password',
    region: 'Region',
    durationHours: 'Cooldown Duration (Hours)',
    notes: 'Notes / Target',
    notesPlaceholder: 'e.g. Daily AP bonus / Ascendant 2',
    startTimerNow: 'Start cooldown countdown immediately upon saving',
    accountNameReq: 'Account name is required',
    usernameReq: 'Riot username is required',
    prefixName: 'Name Prefix',
    startingLevel: 'Starting Level',
    sharedNotes: 'Shared Notes',
    bulkUsernamesLabel: 'Account Usernames (One per line)',
    bulkUsernamesPlaceholder: 'reyna_01#euw\nsage_smurf#na1\njett_ap#1234',
    bulkNotice: 'Each line will automatically generate an account card with the shared password and level.',
    bulkSubmitBtn: 'Generate Accounts Now',
    autoFillPass: 'Auto-fill saved password',
    startAllReady: 'Start Cooldown for All Ready Accounts',
    deleteAll: 'Delete All',
    allRightsReserved: 'All Rights Reserved',
    switchLanguage: 'Language',
  },
  ar: {
    appTitle: 'VALO.LEVELING',
    appSubtitle: 'نظام إدارة كولداون 19 ساعة',
    privateEdition: 'نسخة خاصة',
    owner: 'MO2A',
    changeOwnerName: 'تغيير اسم العلامة المائية',
    enterOwnerName: 'أدخل الاسم الجديد للعلامة المائية:',
    soundOn: 'كتم المؤثرات الصوتية',
    soundOff: 'تشغيل المؤثرات الصوتية',
    bulkAdd: 'إضافة مجمعة (باسوورد موحد)',
    bulkAddSubtitle: 'إضافة عدة حسابات دفعة واحدة مع باسورد ومستوى موحد',
    addAccount: 'إضافة حساب',
    editAccount: 'تعديل بيانات الحساب',
    createAccount: 'إنشاء حساب جديد',
    saveChanges: 'حفظ التعديلات',
    cancel: 'إلغاء',
    allAccounts: 'جميع الحسابات',
    readyToPlay: 'جاهز للعب الآن',
    onCooldown: 'في فترة الانتظار',
    totalRotation: 'إجمالي الحسابات',
    searchPlaceholder: 'ابحث باسم الحساب، اليوزر، الريجون، أو الملاحظات...',
    filterAll: 'الكل',
    filterReady: 'جاهز',
    filterCooldown: 'في الانتظار',
    filterAllRegions: 'جميع المناطق',
    quickCheckmarkTip: 'التشغيل السريع للعداد',
    quickCheckmarkTipDesc: 'اضغط على علامة الصح (✔) بجانب أي حساب لبدء عداد الـ 19 ساعة فور انتهاء مباراتك!',
    rotationLock: 'قفل الـ 19 ساعة',
    noAccountsFound: 'لا توجد حسابات مطابقة',
    noAccountsFilterDesc: 'لا توجد حسابات تطابق خيارات التصفية الحالية. جرب مسح البحث أو تغيير الفلتر.',
    noAccountsEmptyDesc: 'ابدأ بإضافة حساباتك لتتبع عداد الـ 19 ساعة الخاص بمهمات فالورانت اليومية.',
    addFirstAccount: 'إضافة أول حساب',
    copyUser: 'نسخ اليوزر',
    copyPass: 'نسخ الباسورد',
    copied: 'تم النسخ!',
    start19h: 'بدء 19 ساعة',
    resetTimer: 'إعادة ضبط',
    readyStatus: 'جاهز للعب',
    edit: 'تعديل',
    delete: 'حذف',
    confirmDelete: 'هل أنت متأكد من رغبتك في حذف هذا الحساب؟',
    level: 'المستوى (Level)',
    rankedReady: 'جاهز للرانكد 🏆',
    levelsRemaining: 'مستويات متبقية للرانكد',
    username: 'اسم مستخدم Riot',
    password: 'كلمة المرور',
    region: 'السيرفر / المنطقة',
    durationHours: 'مدة الكولداون (بالساعات)',
    notes: 'ملاحظات / الهدف',
    notesPlaceholder: 'مثال: رانك دايموند / مكافأة AP اليومية',
    startTimerNow: 'بدء العد التنازلي للكولداون فور الحفظ',
    accountNameReq: 'اسم الحساب مطلوب',
    usernameReq: 'اسم المستخدم في Riot مطلوب',
    prefixName: 'بادئة الاسم',
    startingLevel: 'الليفل المبدئي',
    sharedNotes: 'ملاحظات مشتركة',
    bulkUsernamesLabel: 'أسماء الحسابات (كل اسم في سطر جديد)',
    bulkUsernamesPlaceholder: 'reyna_01#euw\nsage_smurf#na1\njett_ap#1234',
    bulkNotice: 'سيتم إنشاء بطاقة لكل سطر مع تطبيق الباسوورد والليفل الموحد.',
    bulkSubmitBtn: 'إنشاء الحسابات الآن',
    autoFillPass: 'تعبئة الباسوورد المحفوظ',
    startAllReady: 'بدء العداد لجميع الحسابات الجاهزة',
    deleteAll: 'مسح الكل',
    allRightsReserved: 'جميع الحقوق محفوظة',
    switchLanguage: 'اللغة',
  },
};
