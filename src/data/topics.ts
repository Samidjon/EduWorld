import type { GradeRange, LText, SubjectSlug, Topic, WorldSlug } from "@/types/content";

/**
 * The EduWorld skill graph. Topics are linked by prerequisites; the adaptive engine
 * only recommends a topic once its prerequisites are understood.
 *
 * Grade ranges are EduWorld's own "Core Skills Framework" bands. They are NOT an official
 * national curriculum - see src/data/curricula.ts.
 */

const WORLD_OF: Record<SubjectSlug, WorldSlug> = {
  early: "little-steps",
  math: "numberia",
  reading: "bookoria",
  science: "scientia",
  languages: "lingua",
  tech: "techtown",
};

function t(id: string, grades: GradeRange, title: LText, description: LText, prerequisites: string[], skills: LText[] = []): Topic {
  const subject = id.split(".")[0] as SubjectSlug;
  return { id, subject, world: WORLD_OF[subject], grades, title, description, prerequisites, skills };
}

export const TOPICS: Topic[] = [
  /* ---------- Little Steps (school readiness) ---------- */
  t("early.colors-shapes", [-1, 0], { en: "Colours & Shapes", ru: "Цвета и формы" }, { en: "Name colours, recognise circles, squares and triangles, compare sizes.", ru: "Называем цвета, узнаём круг, квадрат и треугольник, сравниваем размеры." }, [], [{ en: "Visual recognition", ru: "Зрительное восприятие" }]),
  t("early.numbers", [-1, 0], { en: "Numbers 0-10", ru: "Цифры 0-10" }, { en: "Recognise and name the digits from 0 to 10.", ru: "Узнаём и называем цифры от 0 до 10." }, [], [{ en: "Number recognition", ru: "Узнавание цифр" }]),
  t("early.counting", [-1, 1], { en: "Counting Objects", ru: "Счёт предметов" }, { en: "Count objects up to 10 and match them to numbers.", ru: "Считаем предметы до 10 и сопоставляем с цифрами." }, ["early.numbers"], [{ en: "Counting", ru: "Счёт" }]),
  t("early.compare-quantities", [-1, 1], { en: "More, Less, Equal", ru: "Больше, меньше, поровну" }, { en: "Compare groups of objects.", ru: "Сравниваем группы предметов." }, ["early.counting"], [{ en: "Comparing", ru: "Сравнение" }]),
  t("early.letters", [-1, 0], { en: "Meet the Letters", ru: "Знакомство с буквами" }, { en: "Recognise letters, capital and small.", ru: "Узнаём буквы, заглавные и строчные." }, [], [{ en: "Letter recognition", ru: "Узнавание букв" }]),
  t("early.letter-sounds", [-1, 1], { en: "Letter Sounds", ru: "Звуки и буквы" }, { en: "Connect letters with their sounds and first words.", ru: "Связываем буквы со звуками и первыми словами." }, ["early.letters"], [{ en: "Phonics", ru: "Фонетика" }]),
  t("early.patterns", [-1, 1], { en: "Patterns & Memory", ru: "Закономерности и память" }, { en: "Continue sequences, sort objects, train attention.", ru: "Продолжаем последовательности, сортируем предметы, тренируем внимание." }, ["early.colors-shapes"], [{ en: "Logic", ru: "Логика" }, { en: "Attention", ru: "Внимание" }]),
  t("early.nature", [-1, 1], { en: "The World Around Us", ru: "Окружающий мир" }, { en: "Animals, plants, seasons, weather and family.", ru: "Животные, растения, времена года, погода и семья." }, [], [{ en: "Nature knowledge", ru: "Знание природы" }]),

  /* ---------- Numberia (mathematics) ---------- */
  t("math.addition-20", [1, 2], { en: "Addition within 20", ru: "Сложение в пределах 20" }, { en: "Add numbers up to 20 using counting on and making ten.", ru: "Складываем числа до 20 с помощью досчитывания и «перехода через десяток»." }, ["early.counting"]),
  t("math.subtraction-20", [1, 2], { en: "Subtraction within 20", ru: "Вычитание в пределах 20" }, { en: "Take away and find the difference up to 20.", ru: "Вычитаем и находим разность в пределах 20." }, ["math.addition-20"]),
  t("math.compare-numbers", [1, 2], { en: "Comparing Numbers", ru: "Сравнение чисел" }, { en: "Use >, < and = to compare numbers.", ru: "Используем знаки >, < и = для сравнения чисел." }, ["early.compare-quantities"]),
  t("math.place-value", [2, 3], { en: "Tens, Hundreds & Place Value", ru: "Разряды: десятки и сотни" }, { en: "Numbers up to 1000 and what each digit means.", ru: "Числа до 1000 и значение каждой цифры." }, ["math.compare-numbers", "math.addition-20"]),
  t("math.equal-groups", [2, 2], { en: "Equal Groups", ru: "Равные группы" }, { en: "Understand repeated addition with equal groups.", ru: "Понимаем сложение одинаковых слагаемых через равные группы." }, ["math.addition-20"]),
  t("math.multiplication", [2, 3], { en: "Multiplication", ru: "Умножение" }, { en: "Multiplication as equal groups and the times tables.", ru: "Умножение как равные группы и таблица умножения." }, ["math.equal-groups"]),
  t("math.division", [3, 4], { en: "Division", ru: "Деление" }, { en: "Sharing equally and division as the inverse of multiplication.", ru: "Деление поровну и деление как действие, обратное умножению." }, ["math.multiplication"]),
  t("math.word-problems", [1, 4], { en: "Word Problems", ru: "Текстовые задачи" }, { en: "Read a story, find the question and choose the operation.", ru: "Читаем условие, находим вопрос и выбираем действие." }, ["math.addition-20", "math.subtraction-20"]),
  t("math.measurement", [2, 4], { en: "Measurement", ru: "Величины и измерения" }, { en: "Length, mass, time and money.", ru: "Длина, масса, время и деньги." }, ["math.place-value"]),
  t("math.area-perimeter", [3, 5], { en: "Area & Perimeter", ru: "Площадь и периметр" }, { en: "Measure around and inside shapes.", ru: "Измеряем границу и внутреннюю часть фигур." }, ["math.multiplication", "math.measurement"]),
  t("math.fractions", [3, 5], { en: "Fractions", ru: "Обыкновенные дроби" }, { en: "Parts of a whole, equivalent and comparing fractions.", ru: "Части целого, равные дроби и сравнение дробей." }, ["math.division"]),
  t("math.decimals", [5, 6], { en: "Decimals", ru: "Десятичные дроби" }, { en: "Tenths, hundredths and operations with decimals.", ru: "Десятые, сотые и действия с десятичными дробями." }, ["math.fractions", "math.place-value"]),
  t("math.percentages", [5, 6], { en: "Percentages", ru: "Проценты" }, { en: "Percent as parts of 100, finding a percentage of a number.", ru: "Процент как сотая часть, нахождение процента от числа." }, ["math.decimals"]),
  t("math.ratios", [6, 6], { en: "Ratios & Proportions", ru: "Отношения и пропорции" }, { en: "Compare quantities with ratios and solve proportions.", ru: "Сравниваем величины с помощью отношений и решаем пропорции." }, ["math.fractions"]),
  t("math.negative-numbers", [6, 6], { en: "Negative Numbers", ru: "Отрицательные числа" }, { en: "Numbers below zero on the number line.", ru: "Числа меньше нуля на числовой прямой." }, ["math.compare-numbers", "math.subtraction-20"]),
  t("math.coordinates", [6, 7], { en: "Coordinate Plane", ru: "Координатная плоскость" }, { en: "Plot and read points (x, y).", ru: "Отмечаем и читаем точки (x, y)." }, ["math.negative-numbers"]),
  t("math.equations", [5, 7], { en: "Linear Equations", ru: "Линейные уравнения" }, { en: "Find the unknown using inverse operations.", ru: "Находим неизвестное с помощью обратных действий." }, ["math.negative-numbers", "math.division"]),
  t("math.powers", [7, 8], { en: "Powers & Roots", ru: "Степени и корни" }, { en: "Exponents, squares and square roots.", ru: "Показатели степени, квадраты и квадратные корни." }, ["math.multiplication"]),
  t("math.probability", [7, 9], { en: "Probability", ru: "Вероятность" }, { en: "How likely is an event? Probability as a fraction.", ru: "Насколько вероятно событие? Вероятность как дробь." }, ["math.fractions"]),
  t("math.statistics", [7, 9], { en: "Statistics", ru: "Статистика" }, { en: "Mean, median, mode and reading charts.", ru: "Среднее, медиана, мода и чтение диаграмм." }, ["math.decimals"]),
  t("math.functions", [7, 9], { en: "Functions & Graphs", ru: "Функции и графики" }, { en: "Linear functions y = kx + b and their graphs.", ru: "Линейная функция y = kx + b и её график." }, ["math.equations", "math.coordinates"]),
  t("math.quadratics", [8, 9], { en: "Quadratic Equations", ru: "Квадратные уравнения" }, { en: "Solve ax² + bx + c = 0 with the discriminant.", ru: "Решаем ax² + bx + c = 0 через дискриминант." }, ["math.functions", "math.powers"]),
  t("math.geometry", [7, 9], { en: "Plane Geometry", ru: "Планиметрия" }, { en: "Angles, triangles, Pythagoras' theorem.", ru: "Углы, треугольники, теорема Пифагора." }, ["math.area-perimeter", "math.powers"]),
  t("math.trigonometry", [9, 10], { en: "Trigonometry", ru: "Тригонометрия" }, { en: "Sine, cosine and tangent in right triangles.", ru: "Синус, косинус и тангенс в прямоугольном треугольнике." }, ["math.geometry"]),
  t("math.solid-geometry", [10, 11], { en: "Solid Geometry", ru: "Стереометрия" }, { en: "Volumes and surface areas of 3D shapes.", ru: "Объёмы и площади поверхностей объёмных тел." }, ["math.geometry"]),
  t("math.logarithms", [10, 11], { en: "Logarithms", ru: "Логарифмы" }, { en: "Logarithm as the inverse of a power.", ru: "Логарифм как действие, обратное возведению в степень." }, ["math.powers", "math.functions"]),
  t("math.calculus-intro", [10, 11], { en: "Introduction to Calculus", ru: "Начала анализа" }, { en: "Rate of change and derivatives of simple functions.", ru: "Скорость изменения и производные простых функций." }, ["math.functions", "math.quadratics"]),

  /* ---------- Bookoria (reading & literature) ---------- */
  t("reading.syllables", [0, 1], { en: "Syllables", ru: "Слоги" }, { en: "Split words into syllables and read them.", ru: "Делим слова на слоги и читаем их." }, ["early.letter-sounds"]),
  t("reading.words", [1, 1], { en: "Reading Words", ru: "Чтение слов" }, { en: "Read and build simple words.", ru: "Читаем и собираем простые слова." }, ["reading.syllables"]),
  t("reading.sentences", [1, 2], { en: "Sentences", ru: "Предложения" }, { en: "Build sentences, capital letters and full stops.", ru: "Составляем предложения: большая буква и точка." }, ["reading.words"]),
  t("reading.spelling", [2, 4], { en: "Spelling", ru: "Правописание" }, { en: "Common spelling rules and tricky words.", ru: "Основные правила правописания и словарные слова." }, ["reading.words"]),
  t("reading.parts-of-speech", [2, 4], { en: "Parts of Speech", ru: "Части речи" }, { en: "Nouns, verbs and adjectives.", ru: "Существительные, глаголы и прилагательные." }, ["reading.sentences"]),
  t("reading.punctuation", [2, 5], { en: "Punctuation", ru: "Пунктуация" }, { en: "Full stops, question marks, commas.", ru: "Точка, вопросительный знак, запятая." }, ["reading.sentences"]),
  t("reading.comprehension", [2, 6], { en: "Reading Comprehension", ru: "Понимание прочитанного" }, { en: "Find main ideas and details in a text.", ru: "Находим главную мысль и детали в тексте." }, ["reading.sentences"]),
  t("reading.vocabulary", [2, 8], { en: "Vocabulary", ru: "Словарный запас" }, { en: "Synonyms, antonyms and word meanings.", ru: "Синонимы, антонимы и значения слов." }, ["reading.words"]),
  t("reading.morphology", [5, 7], { en: "Word Structure", ru: "Морфология и состав слова" }, { en: "Roots, prefixes and suffixes.", ru: "Корень, приставка, суффикс и окончание." }, ["reading.parts-of-speech"]),
  t("reading.syntax", [7, 9], { en: "Sentence Structure", ru: "Синтаксис" }, { en: "Subject, predicate, simple and complex sentences.", ru: "Подлежащее, сказуемое, простые и сложные предложения." }, ["reading.punctuation", "reading.parts-of-speech"]),
  t("reading.literature", [5, 9], { en: "Literary Genres", ru: "Литературные жанры" }, { en: "Fairy tales, fables, poems, novels and drama.", ru: "Сказки, басни, стихи, романы и драма." }, ["reading.comprehension"]),
  t("reading.text-analysis", [8, 11], { en: "Critical Reading & Essays", ru: "Анализ текста и сочинение" }, { en: "Theme, argument, evidence and essay structure.", ru: "Тема, аргумент, доказательства и структура сочинения." }, ["reading.literature", "reading.syntax"]),

  /* ---------- Scientia (science) ---------- */
  t("science.living-things", [1, 3], { en: "Animals & Plants", ru: "Животные и растения" }, { en: "What living things need and how they grow.", ru: "Что нужно живым существам и как они растут." }, ["early.nature"]),
  t("science.human-body", [1, 4], { en: "The Human Body", ru: "Тело человека" }, { en: "Body parts, senses and staying healthy.", ru: "Части тела, органы чувств и здоровье." }, ["early.nature"]),
  t("science.water-cycle", [2, 4], { en: "Weather & Water Cycle", ru: "Погода и круговорот воды" }, { en: "Evaporation, clouds and rain.", ru: "Испарение, облака и дождь." }, ["early.nature"]),
  t("science.solar-system", [2, 5], { en: "The Solar System", ru: "Солнечная система" }, { en: "The Sun, planets, Moon, day and night.", ru: "Солнце, планеты, Луна, день и ночь." }, []),
  t("science.scientific-method", [3, 11], { en: "The Scientific Method", ru: "Научный метод" }, { en: "Question, hypothesis, experiment, conclusion.", ru: "Вопрос, гипотеза, эксперимент, вывод." }, []),
  t("science.states-of-matter", [3, 6], { en: "States of Matter", ru: "Состояния вещества" }, { en: "Solids, liquids, gases and how they change.", ru: "Твёрдые тела, жидкости, газы и их превращения." }, ["science.water-cycle"]),
  t("science.ecosystems", [4, 7], { en: "Ecosystems & Food Chains", ru: "Экосистемы и пищевые цепи" }, { en: "Producers, consumers and habitats.", ru: "Производители, потребители и среды обитания." }, ["science.living-things"]),
  t("science.cells", [5, 8], { en: "Cells", ru: "Клетки" }, { en: "The building blocks of life.", ru: "Строительные блоки жизни." }, ["science.living-things"]),
  t("science.energy", [5, 8], { en: "Energy & Electricity", ru: "Энергия и электричество" }, { en: "Forms of energy, circuits and conductors.", ru: "Виды энергии, электрические цепи и проводники." }, ["science.states-of-matter"]),
  t("science.forces", [6, 9], { en: "Forces & Motion", ru: "Силы и движение" }, { en: "Gravity, friction and Newton's laws.", ru: "Гравитация, трение и законы Ньютона." }, ["science.energy"]),
  t("science.chemistry-basics", [7, 9], { en: "Atoms & Reactions", ru: "Атомы и реакции" }, { en: "Atoms, molecules and chemical reactions.", ru: "Атомы, молекулы и химические реакции." }, ["science.states-of-matter"]),
  t("science.genetics", [9, 11], { en: "Genetics & Evolution", ru: "Генетика и эволюция" }, { en: "DNA, heredity and natural selection.", ru: "ДНК, наследственность и естественный отбор." }, ["science.cells"]),
  t("science.electromagnetism", [9, 11], { en: "Electromagnetism", ru: "Электромагнетизм" }, { en: "Magnets, fields and electromagnets.", ru: "Магниты, поля и электромагниты." }, ["science.energy", "science.forces"]),

  /* ---------- Lingua (languages) ---------- */
  t("languages.english-basics", [0, 3], { en: "English: First Steps", ru: "Английский: первые шаги" }, { en: "Alphabet and greetings in English.", ru: "Английский алфавит и приветствия." }, []),
  t("languages.english-vocab", [1, 4], { en: "English: Everyday Words", ru: "Английский: слова каждый день" }, { en: "Colours, numbers, animals and family.", ru: "Цвета, числа, животные и семья." }, ["languages.english-basics"]),
  t("languages.english-grammar", [3, 7], { en: "English: Grammar", ru: "Английский: грамматика" }, { en: "To be, plurals and Present Simple.", ru: "Глагол to be, множественное число и Present Simple." }, ["languages.english-vocab"]),
  t("languages.english-dialogues", [4, 9], { en: "English: Dialogues", ru: "Английский: диалоги" }, { en: "Ask and answer simple questions.", ru: "Задаём вопросы и отвечаем на них." }, ["languages.english-grammar"]),
  t("languages.uzbek-basics", [1, 6], { en: "Uzbek: First Steps", ru: "Узбекский: первые шаги" }, { en: "Uzbek Latin alphabet, greetings and numbers.", ru: "Узбекский латинский алфавит, приветствия и числа." }, []),
  t("languages.russian-basics", [1, 6], { en: "Russian: First Steps", ru: "Русский как иностранный: первые шаги" }, { en: "Cyrillic letters, greetings and numbers.", ru: "Кириллица, приветствия и числа для изучающих русский." }, []),

  /* ---------- TechTown (technology) ---------- */
  t("tech.computer-basics", [1, 4], { en: "Computer Basics", ru: "Основы работы с компьютером" }, { en: "Parts of a computer, files and the keyboard.", ru: "Устройство компьютера, файлы и клавиатура." }, []),
  t("tech.internet-safety", [1, 11], { en: "Internet Safety", ru: "Безопасность в интернете" }, { en: "Private information, strong passwords and kindness online.", ru: "Личные данные, надёжные пароли и доброта в сети." }, []),
  t("tech.algorithms", [1, 4], { en: "Algorithms", ru: "Алгоритмы" }, { en: "Step-by-step instructions for a robot.", ru: "Пошаговые инструкции для робота." }, ["early.patterns"]),
  t("tech.loops", [2, 5], { en: "Loops", ru: "Циклы" }, { en: "Repeat blocks to write shorter programs.", ru: "Повторяем блоки, чтобы писать короче." }, ["tech.algorithms"]),
  t("tech.conditions", [3, 6], { en: "Conditions", ru: "Условия" }, { en: "If-then decisions in programs.", ru: "Решения «если - то» в программах." }, ["tech.loops"]),
  t("tech.html", [5, 9], { en: "HTML Basics", ru: "Основы HTML" }, { en: "Tags, headings, paragraphs and links.", ru: "Теги, заголовки, абзацы и ссылки." }, ["tech.computer-basics"]),
  t("tech.css", [6, 9], { en: "CSS Basics", ru: "Основы CSS" }, { en: "Colours, fonts and layout for web pages.", ru: "Цвета, шрифты и расположение элементов страницы." }, ["tech.html"]),
  t("tech.javascript", [7, 11], { en: "JavaScript Basics", ru: "Основы JavaScript" }, { en: "Variables, conditions and functions.", ru: "Переменные, условия и функции." }, ["tech.conditions"]),
  t("tech.python", [7, 11], { en: "Python for Beginners", ru: "Python для начинающих" }, { en: "print, variables, if and loops in Python.", ru: "print, переменные, if и циклы в Python." }, ["tech.conditions"]),
];

export const TOPIC_MAP = new Map(TOPICS.map((tp) => [tp.id, tp]));
export const getTopic = (id: string) => TOPIC_MAP.get(id);
