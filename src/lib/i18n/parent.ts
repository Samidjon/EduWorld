import type { Locale } from "@/types/content";

/**
 * Parent-area interface dictionary (ru / en / uz).
 *
 * Isomorphic on purpose (no next/headers import) so client components can use it too.
 * Server code reads the language with `parentLocaleFrom(await cookies())`
 * (see src/components/parent/server.ts → getParentT()).
 */

export const PARENT_LANG_COOKIE = "ew_lang";
export const DEFAULT_PARENT_LOCALE: Locale = "ru";
export const PARENT_LOCALES: Locale[] = ["ru", "en", "uz"];

export const isParentLocale = (v: unknown): v is Locale => v === "ru" || v === "en" || v === "uz";

/** Server helper: resolve the parent UI language from a cookie jar (`await cookies()`). */
export function parentLocaleFrom(jar: { get(name: string): { value: string } | undefined }): Locale {
  const v = jar.get(PARENT_LANG_COOKIE)?.value;
  return isParentLocale(v) ? v : DEFAULT_PARENT_LOCALE;
}

type Entry = { ru: string; en: string; uz: string };

export const PARENT_DICT = {
  /* ---------- shell ---------- */
  parentArea: { ru: "Кабинет родителя", en: "Parent area", uz: "Ota-ona kabineti" },
  navOverview: { ru: "Обзор", en: "Overview", uz: "Umumiy" },
  navChildren: { ru: "Дети", en: "Children", uz: "Bolalar" },
  navAnalytics: { ru: "Аналитика", en: "Analytics", uz: "Tahlil" },
  navSettings: { ru: "Настройки", en: "Settings", uz: "Sozlamalar" },
  navAccount: { ru: "Аккаунт", en: "Account", uz: "Hisob" },
  mainNav: { ru: "Основная навигация", en: "Main navigation", uz: "Asosiy navigatsiya" },
  logout: { ru: "Выйти", en: "Log out", uz: "Chiqish" },
  loggingOut: { ru: "Выходим…", en: "Logging out…", uz: "Chiqilmoqda…" },
  language: { ru: "Язык", en: "Language", uz: "Til" },
  langRu: { ru: "Русский", en: "Russian", uz: "Ruscha" },
  langEn: { ru: "Английский", en: "English", uz: "Inglizcha" },
  langUz: { ru: "Узбекский", en: "Uzbek", uz: "O‘zbekcha" },
  backToGame: { ru: "Вернуться в игру", en: "Back to game", uz: "O‘yinga qaytish" },

  /* ---------- common ---------- */
  back: { ru: "Назад", en: "Back", uz: "Orqaga" },
  next: { ru: "Далее", en: "Next", uz: "Keyingi" },
  save: { ru: "Сохранить", en: "Save", uz: "Saqlash" },
  saving: { ru: "Сохраняем…", en: "Saving…", uz: "Saqlanmoqda…" },
  saved: { ru: "Сохранено", en: "Saved", uz: "Saqlandi" },
  cancel: { ru: "Отмена", en: "Cancel", uz: "Bekor qilish" },
  edit: { ru: "Изменить", en: "Edit", uz: "Tahrirlash" },
  details: { ru: "Подробнее", en: "Details", uz: "Batafsil" },
  yes: { ru: "Да", en: "Yes", uz: "Ha" },
  no: { ru: "Нет", en: "No", uz: "Yo‘q" },
  never: { ru: "ещё не занимался", en: "no activity yet", uz: "hali faollik yo‘q" },
  years: { ru: "{n} лет", en: "{n} years", uz: "{n} yosh" },
  minutesShort: { ru: "{n} мин", en: "{n} min", uz: "{n} daq" },
  all: { ru: "Все", en: "All", uz: "Hammasi" },
  optional: { ru: "необязательно", en: "optional", uz: "ixtiyoriy" },

  /* ---------- errors ---------- */
  errGeneric: { ru: "Что-то пошло не так. Попробуйте ещё раз.", en: "Something went wrong. Please try again.", uz: "Nimadir xato ketdi. Qayta urinib ko‘ring." },
  errNetwork: { ru: "Нет соединения. Проверьте интернет и попробуйте снова.", en: "No connection. Check your internet and try again.", uz: "Aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring." },
  errUnauthorized: { ru: "Сессия истекла. Войдите снова.", en: "Your session has expired. Please log in again.", uz: "Sessiya tugadi. Qayta kiring." },
  errLocked: { ru: "Кабинет заблокирован. Введите PIN-код.", en: "The parent area is locked. Enter your PIN.", uz: "Kabinet qulflangan. PIN kodni kiriting." },
  errWrongPin: { ru: "Неверный PIN-код.", en: "Wrong PIN.", uz: "PIN kod noto‘g‘ri." },
  errRateLimited: { ru: "Слишком много попыток. Подождите несколько минут.", en: "Too many attempts. Please wait a few minutes.", uz: "Juda ko‘p urinish. Bir necha daqiqa kuting." },
  errInvalidInput: { ru: "Проверьте введённые данные.", en: "Please check the entered data.", uz: "Kiritilgan ma’lumotlarni tekshiring." },
  errTooManyChildren: { ru: "Достигнут лимит профилей детей (6).", en: "You have reached the limit of 6 child profiles.", uz: "Bola profillari chegarasiga (6) yetdingiz." },
  errNotFound: { ru: "Не найдено.", en: "Not found.", uz: "Topilmadi." },
  errInvalidCredentials: { ru: "Текущий пароль неверен.", en: "The current password is incorrect.", uz: "Joriy parol noto‘g‘ri." },
  errWeakPassword: { ru: "Пароль слишком простой.", en: "The password is too weak.", uz: "Parol juda oddiy." },
  errOnboardingRequired: { ru: "Сначала заполните профиль родителя.", en: "Please complete the parent profile first.", uz: "Avval ota-ona profilini to‘ldiring." },
  errCurriculum: { ru: "Выбранная программа недоступна для этой страны.", en: "The selected programme is not available for this country.", uz: "Tanlangan dastur bu davlat uchun mavjud emas." },
  vRequired: { ru: "Обязательное поле", en: "Required", uz: "Majburiy maydon" },
  vTooLong: { ru: "Слишком длинно", en: "Too long", uz: "Juda uzun" },
  vPin4: { ru: "PIN — ровно 4 цифры", en: "PIN must be exactly 4 digits", uz: "PIN aynan 4 ta raqam bo‘lishi kerak" },
  vMin8: { ru: "Минимум 8 символов", en: "At least 8 characters", uz: "Kamida 8 ta belgi" },
  vLetter: { ru: "Нужна хотя бы одна буква", en: "Must contain a letter", uz: "Kamida bitta harf bo‘lishi kerak" },
  vDigit: { ru: "Нужна хотя бы одна цифра", en: "Must contain a digit", uz: "Kamida bitta raqam bo‘lishi kerak" },
  vNicknamePrivate: { ru: "Похоже на личные данные. Используйте простой никнейм.", en: "This looks like personal data. Please use a simple nickname.", uz: "Bu shaxsiy ma’lumotga o‘xshaydi. Oddiy taxallus ishlating." },
  vPinMismatch: { ru: "PIN-коды не совпадают", en: "PINs do not match", uz: "PIN kodlar mos emas" },
  vPasswordMismatch: { ru: "Пароли не совпадают", en: "Passwords do not match", uz: "Parollar mos emas" },
  vConsent: { ru: "Без согласия продолжить нельзя", en: "Consent is required to continue", uz: "Rozilik bo‘lmasa davom etib bo‘lmaydi" },
  vTimeOrder: { ru: "Время окончания должно быть позже начала", en: "End time must be after start time", uz: "Tugash vaqti boshlanishdan keyin bo‘lishi kerak" },
  vDays: { ru: "Выберите хотя бы один день", en: "Pick at least one day", uz: "Kamida bitta kunni tanlang" },
  vRange: { ru: "Значение вне допустимого диапазона", en: "Value is out of range", uz: "Qiymat ruxsat etilgan oraliqdan tashqarida" },

  /* ---------- onboarding ---------- */
  onbTitle: { ru: "Добро пожаловать в EduWorld", en: "Welcome to EduWorld", uz: "EduWorld’ga xush kelibsiz" },
  onbIntro: { ru: "Пара шагов — и ребёнок сможет начать. Сначала немного о вас.", en: "A couple of steps and your child can start. First, a little about you.", uz: "Bir necha qadam — va farzandingiz boshlay oladi. Avval siz haqingizda." },
  displayName: { ru: "Как к вам обращаться", en: "Your display name", uz: "Sizga qanday murojaat qilaylik" },
  displayNameHint: { ru: "Например, «Мама» или «Аня». Видно только вам.", en: "For example “Mum” or “Anna”. Only visible to you.", uz: "Masalan, “Onam” yoki “Anna”. Faqat sizga ko‘rinadi." },
  pinOptional: { ru: "PIN-код родителя (4 цифры)", en: "Parent PIN (4 digits)", uz: "Ota-ona PIN kodi (4 raqam)" },
  pinExplain: { ru: "PIN защищает кабинет родителя: пока устройство в детском режиме, ребёнок не сможет открыть настройки и изменить лимиты без него.", en: "The PIN protects the parent area: while the device is in child mode, your child can’t open settings or change limits without it.", uz: "PIN ota-ona kabinetini himoya qiladi: qurilma bolalar rejimida bo‘lganda, bola usiz sozlamalarni ochib, cheklovlarni o‘zgartira olmaydi." },
  pinConfirm: { ru: "Повторите PIN", en: "Repeat the PIN", uz: "PIN kodni takrorlang" },
  consentTitle: { ru: "Что мы храним", en: "What we store", uz: "Biz nimani saqlaymiz" },
  consentStored: { ru: "Никнейм ребёнка, возраст в полных годах (без даты рождения), класс, выбранные предметы и результаты обучения (ответы, прогресс по темам, время занятий).", en: "Your child’s nickname, age in whole years (no birth date), grade, chosen subjects and learning results (answers, topic progress, time spent learning).", uz: "Bolaning taxallusi, to‘liq yillardagi yoshi (tug‘ilgan sanasiz), sinfi, tanlangan fanlar va o‘qish natijalari (javoblar, mavzular bo‘yicha natijalar, mashg‘ulot vaqti)." },
  consentAi: { ru: "Помощник EduBuddy работает без ИИ: он отвечает из подготовленной базы знаний и не сохраняет вопросы ребёнка.", en: "The EduBuddy helper works without AI: it answers from a prepared knowledge base and does not store the child's questions.", uz: "EduBuddy yordamchisi AI siz ishlaydi: tayyor bilimlar bazasidan javob beradi va bolaning savollarini saqlamaydi." },
  consentControl: { ru: "Вы можете в любой момент выгрузить или удалить все данные ребёнка.", en: "You can export or delete all of your child’s data at any time.", uz: "Istalgan vaqtda bolaning barcha ma’lumotlarini yuklab olishingiz yoki o‘chirishingiz mumkin." },
  consentLabel: { ru: "Я родитель или законный представитель и согласен(на) на обработку этих данных о моём ребёнке.", en: "I am the parent or legal guardian and I consent to the processing of this data about my child.", uz: "Men ota-ona yoki qonuniy vakilman va farzandim haqidagi ushbu ma’lumotlarni qayta ishlashga roziman." },
  onbSubmit: { ru: "Продолжить", en: "Continue", uz: "Davom etish" },
  onbAlready: { ru: "Профиль уже создан.", en: "Your profile already exists.", uz: "Profil allaqachon yaratilgan." },

  /* ---------- unlock ---------- */
  unlockTitle: { ru: "Кабинет родителя", en: "Parent area", uz: "Ota-ona kabineti" },
  unlockIntro: { ru: "Введите PIN-код родителя, чтобы продолжить.", en: "Enter the parent PIN to continue.", uz: "Davom etish uchun ota-ona PIN kodini kiriting." },
  unlockPinLabel: { ru: "Введено цифр PIN: {n} из 4", en: "PIN digits entered: {n} of 4", uz: "Kiritilgan PIN raqamlari: {n} / 4" },
  unlockDelete: { ru: "Стереть цифру", en: "Delete digit", uz: "Raqamni o‘chirish" },
  unlockChecking: { ru: "Проверяем…", en: "Checking…", uz: "Tekshirilmoqda…" },
  unlockOk: { ru: "Готово! Открываем кабинет…", en: "Unlocked! Opening the parent area…", uz: "Ochildi! Kabinet ochilmoqda…" },
  unlockForgot: { ru: "Забыли PIN? Выйдите из аккаунта и войдите снова с паролем — PIN можно будет сменить в настройках.", en: "Forgot the PIN? Log out and log in again with your password, then change the PIN in settings.", uz: "PIN esingizdan chiqdimi? Hisobdan chiqing va parol bilan qayta kiring, so‘ng PIN’ni sozlamalarda o‘zgartiring." },

  /* ---------- wizard ---------- */
  wizTitle: { ru: "Новый профиль ребёнка", en: "New child profile", uz: "Yangi bola profili" },
  wizStepOf: { ru: "Шаг {n} из {total}", en: "Step {n} of {total}", uz: "{total} dan {n}-qadam" },
  wizNickname: { ru: "Как назовём игрока?", en: "What should we call the player?", uz: "O‘yinchini qanday ataymiz?" },
  wizNicknameLabel: { ru: "Никнейм", en: "Nickname", uz: "Taxallus" },
  wizNicknameWarn: { ru: "Используйте никнейм, а не полное имя и фамилию. Не указывайте телефон, e-mail или адрес.", en: "Use a nickname, not the child’s full name. Don’t include a phone number, email or address.", uz: "To‘liq ism-familiya emas, taxallus ishlating. Telefon, e-mail yoki manzilni yozmang." },
  wizAge: { ru: "Сколько лет ребёнку?", en: "How old is your child?", uz: "Farzandingiz necha yoshda?" },
  wizAgeHint: { ru: "Храним только возраст в полных годах — без даты рождения.", en: "We store only the age in whole years — no birth date.", uz: "Faqat to‘liq yillardagi yosh saqlanadi — tug‘ilgan sanasiz." },
  wizGrade: { ru: "В каком классе учится?", en: "Which grade is your child in?", uz: "Nechanchi sinfda o‘qiydi?" },
  wizGradeNote: { ru: "Возраст и класс не связаны жёстко: дети идут в школу в разном возрасте, кто-то учится на дому или по своей программе. Выберите то, что подходит именно вашему ребёнку.", en: "Age and grade are independent: children start school at different ages, some are home-schooled or follow their own pace. Pick what fits your child.", uz: "Yosh va sinf qat’iy bog‘liq emas: bolalar maktabga turli yoshda boradi, kimdir uyda yoki o‘z dasturi bo‘yicha o‘qiydi. Farzandingizga mosini tanlang." },
  wizGradeSuggest: { ru: "Для {age} лет обычно подходит: {grade}", en: "Typical for age {age}: {grade}", uz: "{age} yosh uchun odatda: {grade}" },
  wizGradeUseSuggest: { ru: "Выбрать", en: "Use this", uz: "Tanlash" },
  wizCustomLevel: { ru: "Примерный уровень", en: "Approximate level", uz: "Taxminiy daraja" },
  wizCustomLevelHint: { ru: "Короткая диагностика после создания профиля уточнит уровень по каждому предмету.", en: "A short diagnostic after creating the profile will refine the level for each subject.", uz: "Profil yaratilgandan so‘ng qisqa diagnostika har bir fan bo‘yicha darajani aniqlaydi." },
  wizCountry: { ru: "Страна обучения", en: "Country of study", uz: "O‘qish davlati" },
  wizCurriculum: { ru: "Учебная программа", en: "Learning programme", uz: "O‘quv dasturi" },
  wizCurriculumIntro: { ru: "EduWorld использует собственную программу навыков. Соответствие государственным программам пока в работе.", en: "EduWorld uses its own skills framework. Mapping to national programmes is still in progress.", uz: "EduWorld o‘zining ko‘nikmalar dasturidan foydalanadi. Davlat dasturlariga moslashtirish hali davom etmoqda." },
  draftNote: { ru: "Черновик — это не официальная государственная программа.", en: "Draft — this is not an official national programme.", uz: "Qoralama — bu rasmiy davlat dasturi emas." },
  statusDraft: { ru: "Черновик", en: "Draft", uz: "Qoralama" },
  statusReviewed: { ru: "Проверено", en: "Reviewed", uz: "Tekshirilgan" },
  statusPublished: { ru: "Опубликовано", en: "Published", uz: "E’lon qilingan" },
  statusArchived: { ru: "В архиве", en: "Archived", uz: "Arxivda" },
  notOfficial: { ru: "Не официальная программа", en: "Not an official programme", uz: "Rasmiy dastur emas" },
  wizLanguage: { ru: "Язык интерфейса для ребёнка", en: "Child’s interface language", uz: "Bola uchun interfeys tili" },
  wizSubjects: { ru: "Любимые предметы и цель", en: "Favourite subjects and goal", uz: "Sevimli fanlar va maqsad" },
  wizSubjectsHint: { ru: "Отмеченные предметы будут чаще появляться в рекомендациях. Можно ничего не выбирать.", en: "Selected subjects will appear more often in recommendations. You can leave this empty.", uz: "Belgilangan fanlar tavsiyalarda tez-tez chiqadi. Hech narsa tanlamasangiz ham bo‘ladi." },
  wizGoal: { ru: "Цель обучения", en: "Learning goal", uz: "O‘qish maqsadi" },
  wizAvatar: { ru: "Аватар", en: "Avatar", uz: "Avatar" },
  wizAvatarHint: { ru: "Ребёнок сможет изменить аватар позже в игре.", en: "Your child can change the avatar later in the game.", uz: "Bola avatarni keyinroq o‘yinda o‘zgartira oladi." },
  avatarBase: { ru: "Персонаж", en: "Character", uz: "Personaj" },
  avatarFur: { ru: "Цвет шёрстки", en: "Fur colour", uz: "Jun rangi" },
  avatarOutfit: { ru: "Цвет одежды", en: "Outfit colour", uz: "Kiyim rangi" },
  colorN: { ru: "Цвет {c}", en: "Colour {c}", uz: "Rang {c}" },
  baseFox: { ru: "Лисёнок", en: "Fox", uz: "Tulki" },
  baseBunny: { ru: "Зайка", en: "Bunny", uz: "Quyon" },
  baseBear: { ru: "Медвежонок", en: "Bear", uz: "Ayiq" },
  baseOwl: { ru: "Совёнок", en: "Owl", uz: "Boyo‘g‘li" },
  baseCat: { ru: "Котёнок", en: "Cat", uz: "Mushuk" },
  basePanda: { ru: "Панда", en: "Panda", uz: "Panda" },
  wizReview: { ru: "Проверьте данные", en: "Review", uz: "Ma’lumotlarni tekshiring" },
  wizCreate: { ru: "Создать профиль и начать", en: "Create profile and start", uz: "Profil yaratish va boshlash" },
  wizCreating: { ru: "Создаём профиль…", en: "Creating the profile…", uz: "Profil yaratilmoqda…" },
  wizCreated: { ru: "Профиль создан! Переходим к короткой диагностике…", en: "Profile created! Moving to a short diagnostic…", uz: "Profil yaratildi! Qisqa diagnostikaga o‘tamiz…" },
  wizAfter: { ru: "После создания устройство перейдёт в детский режим, и ребёнок пройдёт короткую диагностику.", en: "After creating, this device switches to child mode and your child takes a short diagnostic.", uz: "Yaratilgandan so‘ng qurilma bolalar rejimiga o‘tadi va bola qisqa diagnostikadan o‘tadi." },
  fieldAge: { ru: "Возраст", en: "Age", uz: "Yosh" },
  fieldGrade: { ru: "Класс", en: "Grade", uz: "Sinf" },
  fieldCountry: { ru: "Страна", en: "Country", uz: "Davlat" },
  fieldCurriculum: { ru: "Программа", en: "Programme", uz: "Dastur" },
  fieldLanguage: { ru: "Язык", en: "Language", uz: "Til" },
  fieldSubjects: { ru: "Предметы", en: "Subjects", uz: "Fanlar" },
  fieldGoal: { ru: "Цель", en: "Goal", uz: "Maqsad" },
  noneSelected: { ru: "не выбрано", en: "none selected", uz: "tanlanmagan" },

  /* ---------- grades & goals ---------- */
  gradeNone: { ru: "Ещё не в школе", en: "Not in school yet", uz: "Hali maktabda emas" },
  gradePrep: { ru: "Подготовительный / нулевой", en: "Pre-school / reception", uz: "Tayyorlov sinfi" },
  gradeN: { ru: "{n} класс", en: "Grade {n}", uz: "{n}-sinf" },
  gradeCustom: { ru: "Своя программа", en: "Own pace", uz: "O‘z dasturi" },
  gradeCustomLevel: { ru: "Своя программа (уровень: {level})", en: "Own pace (level: {level})", uz: "O‘z dasturi (daraja: {level})" },
  levelPreschool: { ru: "дошкольный", en: "pre-school", uz: "maktabgacha" },
  levelPrep: { ru: "подготовка к школе", en: "school readiness", uz: "maktabga tayyorgarlik" },
  levelN: { ru: "как {n} класс", en: "like grade {n}", uz: "{n}-sinf darajasi" },
  goal_school_readiness: { ru: "Подготовка к школе", en: "Getting ready for school", uz: "Maktabga tayyorgarlik" },
  goal_school_support: { ru: "Помощь со школьной программой", en: "Support with schoolwork", uz: "Maktab dasturida yordam" },
  goal_catch_up: { ru: "Подтянуть пробелы", en: "Catch up on gaps", uz: "Bo‘shliqlarni to‘ldirish" },
  goal_get_ahead: { ru: "Учиться с опережением", en: "Get ahead", uz: "Oldinroq o‘rganish" },
  goal_exam_prep: { ru: "Подготовка к экзаменам", en: "Exam preparation", uz: "Imtihonlarga tayyorgarlik" },
  goal_languages: { ru: "Изучение языков", en: "Learning languages", uz: "Tillarni o‘rganish" },
  goal_general: { ru: "Общее развитие", en: "General development", uz: "Umumiy rivojlanish" },

  /* ---------- dashboard ---------- */
  dashTitle: { ru: "Обзор", en: "Overview", uz: "Umumiy ko‘rinish" },
  dashHello: { ru: "Здравствуйте, {name}!", en: "Hello, {name}!", uz: "Salom, {name}!" },
  dashIntro: { ru: "Как идут дела у каждого ребёнка. Каждый учится в своём темпе — мы не сравниваем детей между собой.", en: "How each child is doing. Every child learns at their own pace — we never compare children with each other.", uz: "Har bir bolaning ahvoli. Har bir bola o‘z sur’atida o‘qiydi — biz bolalarni bir-biri bilan solishtirmaymiz." },
  dashEmptyTitle: { ru: "Добавьте первого ребёнка", en: "Add your first child", uz: "Birinchi farzandingizni qo‘shing" },
  dashEmptyText: { ru: "Создайте профиль — это займёт пару минут. Затем ребёнок пройдёт короткую диагностику, и мы подберём персональный маршрут.", en: "Create a profile — it takes a couple of minutes. Your child then takes a short diagnostic and gets a personal learning path.", uz: "Profil yarating — bir necha daqiqa vaqt oladi. So‘ng bola qisqa diagnostikadan o‘tadi va shaxsiy yo‘nalish tanlanadi." },
  addChild: { ru: "Добавить ребёнка", en: "Add a child", uz: "Bola qo‘shish" },
  level: { ru: "Уровень", en: "Level", uz: "Daraja" },
  xp: { ru: "Опыт (XP)", en: "XP", uz: "Tajriba (XP)" },
  coins: { ru: "Монеты", en: "Coins", uz: "Tangalar" },
  streak: { ru: "Серия дней", en: "Day streak", uz: "Kunlar seriyasi" },
  masteredTopics: { ru: "Освоено тем", en: "Topics mastered", uz: "O‘zlashtirilgan mavzular" },
  lessonsThisWeek: { ru: "Уроков за 7 дней", en: "Lessons in 7 days", uz: "7 kunda darslar" },
  lastActivity: { ru: "Последняя активность", en: "Last activity", uz: "Oxirgi faollik" },
  recommendations: { ru: "Что дальше", en: "Up next", uz: "Keyingi qadam" },
  noRecommendations: { ru: "Рекомендации появятся после диагностики.", en: "Recommendations appear after the diagnostic.", uz: "Tavsiyalar diagnostikadan so‘ng paydo bo‘ladi." },
  assessmentPending: { ru: "Диагностика ещё не пройдена", en: "Diagnostic not taken yet", uz: "Diagnostika hali o‘tilmagan" },
  playAs: { ru: "Играть как {name}", en: "Play as {name}", uz: "{name} sifatida o‘ynash" },
  switching: { ru: "Переключаем…", en: "Switching…", uz: "Almashtirilmoqda…" },
  reason_review_due: { ru: "Пора повторить", en: "Review due", uz: "Takrorlash vaqti" },
  reason_needs_review: { ru: "Нужно закрепить", en: "Needs practice", uz: "Mustahkamlash kerak" },
  reason_foundation: { ru: "Основа для следующих тем", en: "Building a foundation", uz: "Keyingi mavzular uchun asos" },
  reason_next_step: { ru: "Следующий шаг", en: "Next step", uz: "Keyingi qadam" },
  reason_stretch: { ru: "Небольшой вызов", en: "A small stretch", uz: "Kichik sinov" },

  /* ---------- children list / details ---------- */
  childrenTitle: { ru: "Дети", en: "Children", uz: "Bolalar" },
  childDetails: { ru: "Профиль ребёнка", en: "Child profile", uz: "Bola profili" },
  editProfile: { ru: "Редактировать профиль", en: "Edit profile", uz: "Profilni tahrirlash" },
  profileSaved: { ru: "Профиль сохранён", en: "Profile saved", uz: "Profil saqlandi" },
  diagnostic: { ru: "Диагностика", en: "Diagnostic", uz: "Diagnostika" },
  diagnosticDone: { ru: "Пройдена {date}", en: "Completed on {date}", uz: "{date} da o‘tilgan" },
  redoDiagnostic: { ru: "Пройти диагностику заново", en: "Redo the diagnostic", uz: "Diagnostikani qayta o‘tish" },
  redoDiagnosticText: { ru: "При следующем входе ребёнок снова пройдёт короткую диагностику. Прогресс сохранится.", en: "Next time your child plays, they’ll take the short diagnostic again. Progress is kept.", uz: "Keyingi safar bola qisqa diagnostikani qayta o‘tadi. Natijalar saqlanadi." },
  redoDone: { ru: "Диагностика будет предложена при следующем входе.", en: "The diagnostic will be offered next time.", uz: "Diagnostika keyingi safar taklif qilinadi." },
  exportData: { ru: "Выгрузить данные (JSON)", en: "Export data (JSON)", uz: "Ma’lumotlarni yuklab olish (JSON)" },
  exportText: { ru: "Файл со всем, что хранится об этом ребёнке.", en: "A file with everything stored about this child.", uz: "Ushbu bola haqida saqlangan barcha ma’lumotlar fayli." },
  deleteChild: { ru: "Удалить профиль ребёнка", en: "Delete child profile", uz: "Bola profilini o‘chirish" },
  deleteChildText: { ru: "Профиль и все результаты обучения будут удалены навсегда. Это нельзя отменить.", en: "The profile and all learning results will be deleted permanently. This cannot be undone.", uz: "Profil va barcha natijalar butunlay o‘chiriladi. Buni bekor qilib bo‘lmaydi." },
  deleteChildConfirm: { ru: "Для подтверждения введите никнейм: {name}", en: "To confirm, type the nickname: {name}", uz: "Tasdiqlash uchun taxallusni kiriting: {name}" },
  deleteForever: { ru: "Удалить навсегда", en: "Delete permanently", uz: "Butunlay o‘chirish" },
  deleting: { ru: "Удаляем…", en: "Deleting…", uz: "O‘chirilmoqda…" },
  dangerZone: { ru: "Данные и удаление", en: "Data & deletion", uz: "Ma’lumotlar va o‘chirish" },
  backToOverview: { ru: "К обзору", en: "Back to overview", uz: "Umumiy ko‘rinishga" },
  created: { ru: "Создан", en: "Created", uz: "Yaratilgan" },

  /* ---------- analytics ---------- */
  anTitle: { ru: "Аналитика", en: "Analytics", uz: "Tahlil" },
  anIntro: { ru: "Подробная картина по одному ребёнку. Все данные — из реальных занятий.", en: "A detailed view of one child at a time, built from real learning activity.", uz: "Bitta bola bo‘yicha batafsil ko‘rinish, haqiqiy mashg‘ulotlar asosida." },
  anChooseChild: { ru: "Выберите ребёнка", en: "Choose a child", uz: "Bolani tanlang" },
  anSubjects: { ru: "Успехи по предметам", en: "Performance by subject", uz: "Fanlar bo‘yicha natijalar" },
  anSubjectsHint: { ru: "Доля верных ответов по всем попыткам.", en: "Share of correct answers across all attempts.", uz: "Barcha urinishlar bo‘yicha to‘g‘ri javoblar ulushi." },
  anAnswers: { ru: "{n} ответов", en: "{n} answers", uz: "{n} ta javob" },
  anMastered: { ru: "Освоенные темы", en: "Mastered topics", uz: "O‘zlashtirilgan mavzular" },
  anReview: { ru: "Темы, которые стоит повторить", en: "Topics to review", uz: "Takrorlash kerak bo‘lgan mavzular" },
  anReviewHint: { ru: "Статус «нужно повторить» или низкое освоение после 4+ попыток.", en: "Marked “needs review”, or low mastery after 4+ attempts.", uz: "“Takrorlash kerak” holati yoki 4+ urinishdan keyin past natija." },
  anMastery: { ru: "освоение {p}%", en: "mastery {p}%", uz: "o‘zlashtirish {p}%" },
  anWeek: { ru: "Активность за 7 дней", en: "Activity — last 7 days", uz: "Faollik — oxirgi 7 kun" },
  anMonth: { ru: "Активность за 30 дней", en: "Activity — last 30 days", uz: "Faollik — oxirgi 30 kun" },
  anDynamics: { ru: "Динамика: уроков в неделю (8 недель)", en: "Progress: lessons per week (8 weeks)", uz: "Dinamika: haftasiga darslar (8 hafta)" },
  anMinutes: { ru: "Минуты", en: "Minutes", uz: "Daqiqalar" },
  anLessons: { ru: "Уроки", en: "Lessons", uz: "Darslar" },
  anTotalMinutes: { ru: "Всего: {n} мин, уроков: {l}", en: "Total: {n} min, lessons: {l}", uz: "Jami: {n} daq, darslar: {l}" },
  anNoData: { ru: "Пока нет данных. Они появятся, когда ребёнок начнёт заниматься.", en: "No data yet. It will appear once your child starts learning.", uz: "Hozircha ma’lumot yo‘q. Bola o‘qishni boshlaganda paydo bo‘ladi." },
  anNoMastered: { ru: "Пока нет освоенных тем — всё впереди!", en: "No mastered topics yet — it’s all ahead!", uz: "Hali o‘zlashtirilgan mavzular yo‘q — hammasi oldinda!" },
  anNoReview: { ru: "Нет тем, требующих повторения.", en: "No topics need review right now.", uz: "Hozircha takrorlash kerak bo‘lgan mavzu yo‘q." },
  anWeekOf: { ru: "нед. с {d}", en: "week of {d}", uz: "{d} haftasi" },
  anDayLabel: { ru: "{d}: {m} мин, уроков: {l}", en: "{d}: {m} min, {l} lessons", uz: "{d}: {m} daq, {l} dars" },
  anWeekLabel: { ru: "Неделя с {d}: уроков {l}", en: "Week of {d}: {l} lessons", uz: "{d} haftasi: {l} dars" },
  anNoChildren: { ru: "Добавьте ребёнка, чтобы увидеть аналитику.", en: "Add a child to see analytics.", uz: "Tahlilni ko‘rish uchun bola qo‘shing." },

  /* ---------- settings ---------- */
  setTitle: { ru: "Настройки", en: "Settings", uz: "Sozlamalar" },
  setIntro: { ru: "Настройки действуют для всех детей в аккаунте.", en: "Settings apply to all children in this account.", uz: "Sozlamalar hisobdagi barcha bolalar uchun amal qiladi." },
  setLimits: { ru: "Расписание и лимиты", en: "Schedule & limits", uz: "Jadval va cheklovlar" },
  dailyLimit: { ru: "Лимит в день, минут", en: "Daily limit, minutes", uz: "Kunlik cheklov, daqiqa" },
  dailyLimitHint: { ru: "0 — без ограничения", en: "0 = no limit", uz: "0 — cheklovsiz" },
  breakEvery: { ru: "Напоминать о перерыве каждые, минут", en: "Break reminder every, minutes", uz: "Tanaffus eslatmasi har, daqiqa" },
  breakEveryHint: { ru: "0 — не напоминать", en: "0 = no reminder", uz: "0 — eslatmasiz" },
  weeklyGoal: { ru: "Цель: уроков в неделю", en: "Goal: lessons per week", uz: "Maqsad: haftasiga darslar" },
  allowedSubjects: { ru: "Доступные предметы", en: "Allowed subjects", uz: "Ruxsat etilgan fanlar" },
  allowedSubjectsHint: { ru: "Если ничего не отмечено — доступны все предметы.", en: "If nothing is selected, all subjects are available.", uz: "Hech narsa belgilanmasa, barcha fanlar ochiq." },
  scheduleOn: { ru: "Ограничить дни и время занятий", en: "Limit days and hours", uz: "Kun va soatlarni cheklash" },
  scheduleDays: { ru: "Дни недели", en: "Days of the week", uz: "Hafta kunlari" },
  scheduleFrom: { ru: "С", en: "From", uz: "Dan" },
  scheduleTo: { ru: "До", en: "To", uz: "Gacha" },
  day0: { ru: "Вс", en: "Sun", uz: "Yak" },
  day1: { ru: "Пн", en: "Mon", uz: "Dush" },
  day2: { ru: "Вт", en: "Tue", uz: "Sesh" },
  day3: { ru: "Ср", en: "Wed", uz: "Chor" },
  day4: { ru: "Чт", en: "Thu", uz: "Pay" },
  day5: { ru: "Пт", en: "Fri", uz: "Jum" },
  day6: { ru: "Сб", en: "Sat", uz: "Shan" },
  setFeatures: { ru: "Функции", en: "Features", uz: "Funksiyalar" },
  fAi: { ru: "Помощник EduBuddy", en: "EduBuddy helper", uz: "EduBuddy yordamchisi" },
  fAiHint: { ru: "Чат-бот с заранее подготовленными ответами (без ИИ). Вопросы не сохраняются.", en: "Chat bot with prepared answers (no AI). Questions are not stored.", uz: "Tayyor javoblarga ega chat-bot (AI emas). Savollar saqlanmaydi." },
  fAiPhoto: { ru: "Фото задач для ИИ", en: "Photo upload for AI", uz: "AI uchun rasm yuklash" },
  fAiPhotoHint: { ru: "Ребёнок может сфотографировать задачу из тетради.", en: "Your child can take a photo of a task from a workbook.", uz: "Bola daftardagi masalani suratga olishi mumkin." },
  fAiHistory: { ru: "Сохранять историю ИИ", en: "Save AI history", uz: "AI tarixini saqlash" },
  fAiHistoryHint: { ru: "Вы сможете просмотреть переписку ниже. Хранится 90 дней.", en: "You can review conversations below. Kept for 90 days.", uz: "Yozishmalarni quyida ko‘rishingiz mumkin. 90 kun saqlanadi." },
  fGames: { ru: "Мини-игры", en: "Mini-games", uz: "Mini-o‘yinlar" },
  fShop: { ru: "Магазин (за игровые монеты)", en: "Shop (game coins only)", uz: "Do‘kon (faqat o‘yin tangalari)" },
  setNotifications: { ru: "Уведомления", en: "Notifications", uz: "Bildirishnomalar" },
  nWeekly: { ru: "Еженедельный отчёт", en: "Weekly report", uz: "Haftalik hisobot" },
  nAchievements: { ru: "Достижения детей", en: "Children’s achievements", uz: "Bolalar yutuqlari" },
  saveSettings: { ru: "Сохранить настройки", en: "Save settings", uz: "Sozlamalarni saqlash" },
  settingsSaved: { ru: "Настройки сохранены", en: "Settings saved", uz: "Sozlamalar saqlandi" },
  setPin: { ru: "PIN-код родителя", en: "Parent PIN", uz: "Ota-ona PIN kodi" },
  pinIsSet: { ru: "PIN установлен. Кабинет защищён, когда устройство в детском режиме.", en: "A PIN is set. The parent area is protected while the device is in child mode.", uz: "PIN o‘rnatilgan. Qurilma bolalar rejimida bo‘lganda kabinet himoyalangan." },
  pinNotSet: { ru: "PIN не установлен. Ребёнок может открыть кабинет родителя без кода.", en: "No PIN is set. Your child can open the parent area without a code.", uz: "PIN o‘rnatilmagan. Bola kabinetni kodsiz ochishi mumkin." },
  newPin: { ru: "Новый PIN", en: "New PIN", uz: "Yangi PIN" },
  setPinBtn: { ru: "Сохранить PIN", en: "Save PIN", uz: "PIN’ni saqlash" },
  removePin: { ru: "Убрать PIN", en: "Remove PIN", uz: "PIN’ni olib tashlash" },
  pinSaved: { ru: "PIN сохранён", en: "PIN saved", uz: "PIN saqlandi" },
  pinRemoved: { ru: "PIN удалён", en: "PIN removed", uz: "PIN olib tashlandi" },
  setPrivacy: { ru: "Конфиденциальность", en: "Privacy", uz: "Maxfiylik" },
  privacyRetention: { ru: "Детальные ответы хранятся для анализа ошибок и периодически очищаются. Профиль и прогресс хранятся, пока вы их не удалите.", en: "Detailed answers are kept for mistake analysis and purged periodically. The profile and progress are kept until you delete them.", uz: "Batafsil javoblar xatolarni tahlil qilish uchun saqlanadi va vaqti-vaqti bilan tozalanadi. Profil va natijalar siz o‘chirmaguningizcha saqlanadi." },
  aiHistory: { ru: "История ИИ-помощника", en: "AI tutor history", uz: "AI yordamchi tarixi" },
  aiHistoryNote: { ru: "Последние 50 сообщений. История автоматически удаляется через 90 дней.", en: "Last 50 messages. History is deleted automatically after 90 days.", uz: "Oxirgi 50 ta xabar. Tarix 90 kundan keyin avtomatik o‘chiriladi." },
  aiHistoryOff: { ru: "Сохранение истории выключено — новые сообщения не сохраняются.", en: "History saving is off — new messages are not stored.", uz: "Tarixni saqlash o‘chirilgan — yangi xabarlar saqlanmaydi." },
  aiHistoryEmpty: { ru: "Сообщений нет.", en: "No messages.", uz: "Xabarlar yo‘q." },
  roleUser: { ru: "Ребёнок", en: "Child", uz: "Bola" },
  roleAssistant: { ru: "ИИ-помощник", en: "AI tutor", uz: "AI yordamchi" },
  flagged: { ru: "Отмечено фильтром безопасности", en: "Flagged by safety filter", uz: "Xavfsizlik filtri belgilagan" },
  showHistory: { ru: "Показать историю ({n})", en: "Show history ({n})", uz: "Tarixni ko‘rsatish ({n})" },

  /* ---------- account ---------- */
  accTitle: { ru: "Аккаунт", en: "Account", uz: "Hisob" },
  accEmail: { ru: "E-mail для входа", en: "Login email", uz: "Kirish uchun e-mail" },
  accName: { ru: "Имя", en: "Display name", uz: "Ism" },
  nameSaved: { ru: "Имя сохранено", en: "Name saved", uz: "Ism saqlandi" },
  accPassword: { ru: "Смена пароля", en: "Change password", uz: "Parolni o‘zgartirish" },
  currentPassword: { ru: "Текущий пароль", en: "Current password", uz: "Joriy parol" },
  newPassword: { ru: "Новый пароль", en: "New password", uz: "Yangi parol" },
  repeatPassword: { ru: "Повторите новый пароль", en: "Repeat new password", uz: "Yangi parolni takrorlang" },
  passwordRules: { ru: "Минимум 8 символов, хотя бы одна буква и одна цифра.", en: "At least 8 characters, including a letter and a digit.", uz: "Kamida 8 ta belgi, kamida bitta harf va bitta raqam." },
  changePassword: { ru: "Сменить пароль", en: "Change password", uz: "Parolni o‘zgartirish" },
  passwordChanged: { ru: "Пароль изменён", en: "Password changed", uz: "Parol o‘zgartirildi" },
  accDelete: { ru: "Удаление аккаунта", en: "Delete account", uz: "Hisobni o‘chirish" },
  accDeleteText: { ru: "Будут удалены аккаунт, все профили детей и все результаты обучения. Это нельзя отменить.", en: "Your account, all child profiles and all learning results will be deleted. This cannot be undone.", uz: "Hisob, barcha bola profillari va natijalar o‘chiriladi. Buni bekor qilib bo‘lmaydi." },
  accDeleteConfirm: { ru: "Введите DELETE для подтверждения", en: "Type DELETE to confirm", uz: "Tasdiqlash uchun DELETE deb yozing" },
  accDeleteBtn: { ru: "Удалить аккаунт навсегда", en: "Delete account permanently", uz: "Hisobni butunlay o‘chirish" },
  accSession: { ru: "Сеанс", en: "Session", uz: "Seans" },
  accSessionText: { ru: "Выйти из аккаунта на этом устройстве.", en: "Log out of your account on this device.", uz: "Ushbu qurilmada hisobdan chiqish." },
} satisfies Record<string, Entry>;

export type ParentKey = keyof typeof PARENT_DICT;

/** Translate a parent-area key; `{var}` placeholders are replaced from `vars`. */
export function pt(locale: Locale, key: ParentKey, vars?: Record<string, string | number>): string {
  const e: Entry = PARENT_DICT[key];
  let s = e[locale] ?? e.ru;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export type PT = (key: ParentKey, vars?: Record<string, string | number>) => string;
export const makePT = (locale: Locale): PT => (key, vars) => pt(locale, key, vars);

/** Map an API error code (ApiError.code) to a dictionary key. */
export function errorKey(code: string | undefined): ParentKey {
  switch (code) {
    case "network": return "errNetwork";
    case "unauthorized": return "errUnauthorized";
    case "parent_locked": return "errLocked";
    case "wrong_pin": return "errWrongPin";
    case "rate_limited": return "errRateLimited";
    case "invalid_input": return "errInvalidInput";
    case "too_many_children": return "errTooManyChildren";
    case "not_found": return "errNotFound";
    case "invalid_credentials": return "errInvalidCredentials";
    case "weak_password": return "errWeakPassword";
    case "onboarding_required": return "errOnboardingRequired";
    case "unknown_curriculum":
    case "curriculum_country_mismatch": return "errCurriculum";
    default: return "errGeneric";
  }
}

/** Map a zod validation message (from src/lib/validation.ts or the parent forms) to a dictionary key. */
export function validationKey(message: string | undefined): ParentKey {
  switch (message) {
    case "pin4": return "vPin4";
    case "min8": return "vMin8";
    case "letter": return "vLetter";
    case "digit": return "vDigit";
    case "nickname_private": return "vNicknamePrivate";
    case "pin_mismatch": return "vPinMismatch";
    case "password_mismatch": return "vPasswordMismatch";
    case "consent": return "vConsent";
    case "time_order": return "vTimeOrder";
    case "days": return "vDays";
    case "too_long": return "vTooLong";
    case "range": return "vRange";
    default: return "vRequired";
  }
}
