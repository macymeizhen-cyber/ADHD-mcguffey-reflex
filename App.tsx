import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';

// ==========================================
// 完完整整 1-30 课麦加菲精细化数据库（无动态循环）
// ==========================================
const mcguffeyTasks = [
  { id: 'mg1_l1', title: '📖 Lesson 1: The Cat and Rat', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Read aloud with absolute focus on visual anchors:\n\n"A cat. A rat. A cat and a rat.\n\nThe cat. The rat. The cat caught the rat."' },
    { type: 'quiz', title: '🧠 Action Reflection', question: 'What dynamic action did the cat successfully perform in this lesson?', options: ['The cat ran away from the rat', 'The cat caught the rat', 'The cat was sleeping near the rat'], correct: 1, explain: '🎯 Correct! "The cat caught the rat" establishes your first active transitive verb connection.' }
  ]},
  { id: 'mg1_l2', title: '📖 Lesson 2: Nat and the Cat', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Master the proper nouns and short vowel linking:\n\n"Nat. A lad. Nat is a lad.\n\nHas Nat a cat? Nat has a cat."' },
    { type: 'quiz', title: '🧠 Possession Mapping', question: 'Who owns or holds possession of the cat in this scenario?', options: ['The rat does', 'A random lad does', 'Nat does'], correct: 2, explain: '🎯 Brilliant! "Nat has a cat" asserts possession without translating back to Chinese.' }
  ]},
  { id: 'mg1_l3', title: '📖 Lesson 3: The Big Hat', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Observe descriptive modifiers:\n\n"A hat. A big hat. It is a big hat.\n\nHas Nat a big hat? Nat has a big hat."' },
    { type: 'quiz', title: '🧠 Attribute Verification', question: 'What is the specific structural characteristic of Nat\'s hat?', options: ['It is a small hat', 'It is a big hat', 'It belongs to the cat'], correct: 1, explain: '🎯 Spot on! Modifier "big" precedes the noun "hat" organically.' }
  ]},
  { id: 'mg1_l4', title: '📖 Lesson 4: Ned and the Dog', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Focus on short "e" and "o" dynamic variations:\n\n"Ned. A dog. A big dog.\n\nNed has a big dog. The dog ran."' },
    { type: 'quiz', title: '🧠 Event Detection', question: 'What physical action did Ned\'s big dog execute?', options: ['The dog sat down', 'The dog bit the cat', 'The dog ran'], correct: 2, explain: '🎯 Perfect! Direct identification of the intransitive action "ran".' }
  ]},
  { id: 'mg1_l5', title: '📖 Lesson 5: The Fan and the Bed', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Practice passive situational placement:\n\n"A fan. A bed. A fan is on the bed.\n\nHas Ann a fan? Ann has a fan."' },
    { type: 'quiz', title: '🧠 Spatial Logic', question: 'Where is the fan physically positioned according to the text?', options: ['Under the bed', 'On the bed', 'In Ann\'s hand'], correct: 1, explain: '🎯 Correct! The preposition "on" anchors spatial relationships instantly.' }
  ]},
  { id: 'mg1_l6', title: '📖 Lesson 6: The Pen and the Box', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Contrast prepositions "on" versus "in":\n\n"A pen. A box. A pen is in the box.\n\nBen has a pen. The pen is for Ben."' },
    { type: 'quiz', title: '🧠 Spatial Container Logic', question: 'Where is Ben\'s pen currently nested?', options: ['In the box', 'On top of the box', 'Lost on the ground'], correct: 0, explain: '🎯 Excellent! "In the box" implies containment inside an object.' }
  ]},
  { id: 'mg1_l7', title: '📖 Lesson 7: The Cap and the Mat', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Refine vocal tracking of short vowels:\n\n"A cap. A mat. The cap is on the mat.\n\nSam has a cap. It is Sam\'s cap."' },
    { type: 'quiz', title: '🧠 Ownership Identification', question: 'To whom does the cap on the mat belong?', options: ['It belongs to Ben', 'It belongs to Sam', 'It belongs to Ned'], correct: 1, explain: '🎯 Correct! "Sam\'s cap" signifies possessive syntax explicitly.' }
  ]},
  { id: 'mg1_l8', title: '📖 Lesson 8: Red Fox on the Log', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Observe dynamic visual descriptions:\n\n"A fox. A red fox. The fox is by a log.\n\nCan the fox run? The red fox can run fast."' },
    { type: 'quiz', title: '🧠 Velocity Review', question: 'How is the running capacity of the red fox described?', options: ['It runs slowly', 'It cannot run at all', 'It can run fast'], correct: 2, explain: '🎯 Superb! "Run fast" hardwires velocity tracking directly.' }
  ]},
  { id: 'mg1_l9', title: '📖 Lesson 9: Top and the Box', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Coordinate question voice patterns:\n\n"A top. A toy top. The top is on a box.\n\nTom has a top. Can Tom spin the top?"' },
    { type: 'quiz', title: '🧠 Toy Placement Verification', question: 'Where is Tom\'s toy top resting?', options: ['On a box', 'Inside a deep pocket', 'Under the bed'], correct: 0, explain: '🎯 Brilliant! "On a box" establishes surface contact.' }
  ]},
  { id: 'mg1_l10', title: '📖 Lesson 10: The Pig and the Mud', pool: "McGuffey's First Reader", duration: 'Foundation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Track basic environment descriptive items:\n\n"A pig. A big pig. The pig is in the mud.\n\nCan the big pig run? Yes, the pig can run."' },
    { type: 'quiz', title: '🧠 Environment Context', question: 'Where is the big pig physically situated?', options: ['On a comfortable bed', 'In the mud', 'In a secure box'], correct: 1, explain: '🎯 Correct! "In the mud" maps the scene accurately without mental translation.' }
  ]},
  { id: 'mg1_l11', title: '📖 Lesson 11: The Milk Cow', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Read with native noun-action linkages:\n\n"A cow. A good cow. The cow gives us milk.\n\nDo you see the cow? Yes, she is by the barn."' },
    { type: 'quiz', title: '🧠 Utility Identification', question: 'What primary benefit does the cow provide according to the text?', options: ['She guards the farm', 'She gives us milk', 'She runs in races'], correct: 1, explain: '🎯 Correct! The verb "gives" immediately connects the agent to its output.' }
  ]},
  { id: 'mg1_l12', title: '📖 Lesson 12: A Nest in the Tree', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Anchor spatial nests in memory:\n\n"A nest. A bird\'s nest. It is in the tree.\n\nThe nest has eggs. Can you see four blue eggs?"' },
    { type: 'quiz', title: '🧠 Detail Detection', question: 'What is inside the bird\'s nest in the tree?', options: ['Four blue eggs', 'Two young rats', 'A small cat'], correct: 0, explain: '🎯 Spot on! "Four blue eggs" sets up specific numerical and color adjectives.' }
  ]},
  { id: 'mg1_l13', title: '📖 Lesson 13: The Gentle Sheep', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Connect gentle attributes organically:\n\n"The sheep. A harmless sheep. It gives us soft wool.\n\nSee them feed on the green hill!"' },
    { type: 'quiz', title: '🧠 Product Matching', question: 'What raw physical material do we get from the harmless sheep?', options: ['Hard milk', 'Soft wool', 'Deep mud'], correct: 1, explain: '🎯 Perfect! "Soft wool" pairs the tactile adjective with the noun directly.' }
  ]},
  { id: 'mg1_l14', title: '📖 Lesson 14: The New Doll', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Read with clear conversational cadence:\n\n"See my nice, new doll! Her name is May.\n\nShe has blue eyes and a tiny red hat."' },
    { type: 'quiz', title: '🧠 Name Association', question: 'What is the designated name of the new doll?', options: ['Ann', 'May', 'Sue'], correct: 1, explain: '🎯 Correct! Direct name mapping bypasses structural translation.' }
  ]},
  { id: 'mg1_l15', title: '📖 Lesson 15: The Boy and the Barn', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Map spatial movements of characters:\n\n"The boy is at the barn. He has a fast horse.\n\nWill he ride the horse? Yes, he will ride now."' },
    { type: 'quiz', title: '🧠 Intention Check', question: 'What will the boy do at the barn?', options: ['He will ride the horse', 'He will feed the cat', 'He will sleep on the hay'], correct: 0, explain: '🎯 Correct! "He will ride the horse" chains intention and future tense directly.' }
  ]},
  { id: 'mg1_l16', title: '📖 Lesson 16: Girl and the Rose', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Express sensory appreciation directly:\n\n"See this beautiful rose. It has a sweet smell.\n\nGive the sweet rose to your dear mother."' },
    { type: 'quiz', title: '🧠 Action Target', question: 'To whom are you instructed to give the sweet rose?', options: ['To your dear mother', 'To Nat the lad', 'To the blind man'], correct: 0, explain: '🎯 Spot on! Immediate target mapping for direct prepositional flow.' }
  ]},
  { id: 'mg1_l17', title: '📖 Lesson 17: Pig and the Pen', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Balance descriptive states against action:\n\n"The pig is fat. It lives in a clean pen.\n\nDo not let the fat pig run into our garden."' },
    { type: 'quiz', title: '🧠 Boundary Logic', question: 'Where must the fat pig be prevented from running?', options: ['Into our garden', 'Into the mud', 'Into the deep well'], correct: 0, explain: '🎯 Correct! Direct locative exclusion maps native spatial limits.' }
  ]},
  { id: 'mg1_l18', title: '📖 Lesson 18: The Deep Well', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Read with warning intonation:\n\n"The well is deep. The water is cold.\n\nDo not go near the well, little children!"' },
    { type: 'quiz', title: '🧠 Danger Recognition', question: 'What safety rule is given to the little children?', options: ['Do not drink the cold water', 'Do not go near the well', 'Do not feed the dog'], correct: 1, explain: '🎯 Superb! Warning patterns help formulate natural imperative structures.' }
  ]},
  { id: 'mg1_l19', title: '📖 Lesson 19: The Hen and Her Chicks', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Capture nesting instinct and movement:\n\n"The hen has a warm nest. She has ten little chicks.\n\nThey run to her when she calls them to eat."' },
    { type: 'quiz', title: '🧠 Family Count', question: 'How many little chicks does the warm hen have?', options: ['Four chicks', 'Ten little chicks', 'No chicks'], correct: 1, explain: '🎯 Correct! Quantifying items directly in English builds visual counting models.' }
  ]},
  { id: 'mg1_l20', title: '📖 Lesson 20: The Still Pond', pool: "McGuffey's First Reader", duration: 'Developing', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Describe aquatic life simply:\n\n"The pond is still and clear. See the fish swim.\n\nDo not throw stones into the quiet water."' },
    { type: 'quiz', title: '🧠 Behavioral Boundary', question: 'What negative action should you avoid near the still pond?', options: ['Throwing stones into the water', 'Watching the fish swim', 'Drinking the clear water'], correct: 0, explain: '🎯 Excellent! "Do not throw..." instills native imperative prohibitions.' }
  ]},
  { id: 'mg1_l21', title: '📖 Lesson 21: The Blind Man', pool: "McGuffey's First Reader", duration: 'Expanding', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Empathy and transitive action linkage:\n\n"An old man who is blind sits by the cold road.\n\nLet us lead him safely across the busy street."' },
    { type: 'quiz', title: '🧠 Proactive Deeds', question: 'What proactive deed should we perform for the blind old man?', options: ['Give him a red rose', 'Lead him safely across the busy street', 'Buy his toy top'], correct: 1, explain: '🎯 Correct! Empathy-driven active response with proper spatial movement.' }
  ]},
  { id: 'mg1_l22', title: '📖 Lesson 22: The Singing Robin', pool: "McGuffey's First Reader", duration: 'Expanding', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Observe natural descriptors:\n\n"The sweet robin sings in the green apple tree.\n\nHe sings a song of joy for the bright morning."' },
    { type: 'quiz', title: '🧠 Location Mapping', question: 'Where is the singing robin physically perched?', options: ['On a cold log', 'In the green apple tree', 'In the clean pig pen'], correct: 1, explain: '🎯 Correct! Visualizing specific trees anchors complex environments naturally.' }
  ]},
  { id: 'mg1_l23', title: '📖 Lesson 23: The Little Lamp', pool: "McGuffey's First Reader", duration: 'Expanding', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Illuminate physical surroundings:\n\n"The little lamp is on the table. It gives us light in the dark.\n\nDo not tip the warm oil lamp over!"' },
    { type: 'quiz', title: '🧠 Hazard Avoidance', question: 'What warning is given regarding the warm oil lamp?', options: ['Do not throw it in the well', 'Do not tip it over', 'Do not read near it'], correct: 1, explain: '🎯 Correct! "Do not tip... over" builds physical reflex safety mapping.' }
  ]},
  { id: 'mg1_l24', title: '📖 Lesson 24: Lucy and Her Kitten', pool: "McGuffey's First Reader", duration: 'Expanding', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Observe affection and dynamic verbs:\n\n"Lucy has a playful little kitten. It likes to run after a ball.\n\nLucy feeds her fresh milk every single morning."' },
    { type: 'quiz', title: '🧠 Diet Checking', question: 'What does Lucy feed her playful little kitten every morning?', options: ['Fresh milk', 'Soft wool', 'A blue egg'], correct: 0, explain: '🎯 Correct! Direct linking of agent, action, and target food source.' }
  ]},
  { id: 'mg1_l25', title: '📖 Lesson 25: The Heavy Cart', pool: "McGuffey's First Reader", duration: 'Expanding', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Model labor and animal drive structures:\n\n"The cart is heavy. Two strong oxen pull the cart.\n\nThey walk slowly along the dusty country road."' },
    { type: 'quiz', title: '🧠 Force and Mechanics', question: 'What is pulling the heavy cart along the road?', options: ['Two fast horses', 'Two strong oxen', 'The little lad'], correct: 1, explain: '🎯 Correct! Oxford-level reading linking heavy loading with steady oxen movement.' }
  ]},
  { id: 'mg1_l26', title: '📖 Lesson 26: The Busy Bees', pool: "McGuffey's First Reader", duration: 'Expanding', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Track environmental industrious behaviors:\n\n"See the busy bees! They fly from flower to flower.\n\nThey gather sweet honey to store in their hive."' },
    { type: 'quiz', title: '🧠 Objective Detection', question: 'Why do the busy bees fly from flower to flower?', options: ['To hide from the cat', 'To gather sweet honey', 'To sleep in the sun'], correct: 1, explain: '🎯 Perfect! "Gather sweet honey" links animal purpose with seasonal activity.' }
  ]},
  { id: 'mg1_l27', title: '📖 Lesson 27: Sledding on the Snow', pool: "McGuffey's First Reader", duration: 'Complex', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Capture winter motion and group dynamics:\n\n"The white snow is deep on the hill. The boys have sleds.\n\nThey slide down the cold hill with great speed!"' },
    { type: 'quiz', title: '🧠 Season and Action', question: 'What physical activity are the boys performing on the snowy hill?', options: ['Swimming in the pool', 'Sledding / sliding down the hill', 'Planting a rose tree'], correct: 1, explain: '🎯 Correct! "Slide down the hill" establishes quick dynamic spatial action.' }
  ]},
  { id: 'mg1_l28', title: '📖 Lesson 28: Saving the Lost Coin', pool: "McGuffey's First Reader", duration: 'Complex', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Follow search and discovery sequences:\n\n"Ann lost a silver coin in the soft grass.\n\nHer brother found it for her. Now she is very glad."' },
    { type: 'quiz', title: '🧠 Resolution Target', question: 'How is Ann\'s situation resolved in this story?', options: ['She bought sweet candy', 'Her brother found the lost coin', 'She went to sleep on the bed'], correct: 1, explain: '🎯 Correct! The transition from "lost" to "found" creates clear logical closure.' }
  ]},
  { id: 'mg1_l29', title: '📖 Lesson 29: The Watch Dog at Night', pool: "McGuffey's First Reader", duration: 'Complex', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Contrast duty and nocturnal environments:\n\n"The large watch dog stays awake at night. He guards the house.\n\nWhen thieves come near, he barks loud to wake us."' },
    { type: 'quiz', title: '🧠 Functional Purpose', question: 'What trigger causes the large watch dog to bark loudly at night?', options: ['When he sees his warm nest', 'When thieves come near the house', 'When the sun rises in the morning'], correct: 1, explain: '🎯 Spot on! "Thieves come near" maps out causation and conditional action.' }
  ]},
  { id: 'mg1_l30', title: '📖 Lesson 30: The Eclectic Graduation (Halfway)', pool: "McGuffey's First Reader", duration: 'Graduation', steps: [
    { type: 'learn', title: '💡 Shadow Reading Framework', content: 'Reflect on systemic progress and linguistic control:\n\n"You have finished thirty lessons with active diligence.\n\nYour pronunciation is clear, your visual mapping is solid, and you are ready for advanced reader steps!"' },
    { type: 'quiz', title: '🧠 Progress Assessment', question: 'What milestone have you achieved by finishing Lesson 30?', options: ['A simple copy task', 'Completed 30 high-impact reflex lessons', 'Learned how to run like a red fox'], correct: 1, explain: '🎯 Incredible! You have established a robust 30-lesson neural bridge. Your English Reflex Engine is officially humming!' }
  ]}
];

// ==========================================
// APP 交互核心组件
// ==========================================
export default function App() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); 
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [shadowVerified, setShadowVerified] = useState(false); 
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [streak, setStreak] = useState(3);

  useEffect(() => {
    const restoreProgress = async () => {
      try {
        const saved = await AsyncStorage.getItem('@brainquest:progress');
        if (!saved) return;

        const parsed = JSON.parse(saved) as {
          completedLessons?: string[];
          currentLessonIndex?: number;
          streak?: number;
        };

        if (Array.isArray(parsed.completedLessons)) {
          setCompletedLessons(parsed.completedLessons);
        }

        if (typeof parsed.currentLessonIndex === 'number') {
          setCurrentLessonIndex(Math.min(parsed.currentLessonIndex, mcguffeyTasks.length - 1));
        }

        if (typeof parsed.streak === 'number') {
          setStreak(parsed.streak);
        }
      } catch (error) {
        console.warn('Unable to restore BrainQuest progress', error);
      }
    };

    restoreProgress();
  }, []);

  useEffect(() => {
    const persistProgress = async () => {
      try {
        await AsyncStorage.setItem(
          '@brainquest:progress',
          JSON.stringify({ completedLessons, currentLessonIndex, streak })
        );
      } catch (error) {
        console.warn('Unable to save BrainQuest progress', error);
      }
    };

    persistProgress();
  }, [completedLessons, currentLessonIndex, streak]);

  const currentLesson = mcguffeyTasks[currentLessonIndex];
  const currentStep = currentLesson.steps[currentStepIndex];
  const completionPercent = (completedLessons.length / mcguffeyTasks.length) * 100;
  const focusScore = completedLessons.length * 10 + (shadowVerified ? 5 : 0) + streak * 2;
  const dailyMission = currentStepIndex === 0 ? 'Shadow read the passage aloud three times.' : 'Answer the reflex check with confidence.';

  const loadLesson = (index: number) => {
    setCurrentLessonIndex(index);
    setCurrentStepIndex(0);
    setSelectedOption(null);
    setQuizAnswered(false);
    setShadowVerified(false);
    setMenuVisible(false);
  };

  const handleVocalVerify = () => {
    setShadowVerified(true);
  };

  const handleOptionSelect = (index: number) => {
    if (quizAnswered) return;
    setSelectedOption(index);
    setQuizAnswered(true);
  };

  const handleNext = () => {
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    } else {
      if (!completedLessons.includes(currentLesson.id)) {
        setCompletedLessons(prev => [...prev, currentLesson.id]);
      }
      setStreak(prev => prev + 1);

      if (currentLessonIndex < mcguffeyTasks.length - 1) {
        loadLesson(currentLessonIndex + 1);
      } else {
        Alert.alert('🎉 Congratulations!', 'You completed all 30 lessons of McGuffey Book 1!');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部状态栏及进度 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>BrainQuest: Reflex Engine</Text>
          <Text style={styles.progressText}>
            Progress: {completedLessons.length} / {mcguffeyTasks.length} mastered
          </Text>
          <Text style={styles.headerMeta}>🔥 Streak {streak} days • ✨ Focus {focusScore}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuButtonText}>📋 1-30 Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${completionPercent}%` }
          ]}
        />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryLabel}>Daily mission</Text>
          <Text style={styles.summaryValue}>{dailyMission}</Text>
        </View>
      </View>

      {/* 主核心交互区 */}
      <ScrollView contentContainerStyle={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.badgeContainer}>
            <Text style={styles.levelBadge}>{currentLesson.duration}</Text>
          </View>
          <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>

          {/* 步骤 1：纯英文影子跟读 */}
          {currentStepIndex === 0 ? (
            <View style={styles.learningSection}>
              <Text style={styles.learnParagraph}>
                {currentStep.content}
              </Text>
              
              <Text style={styles.shadowTip}>
                ⚠️ Read aloud 3 times. Move your lips and lock in the dynamic reflex.
              </Text>

              <TouchableOpacity 
                style={[styles.vocalBtn, shadowVerified && styles.vocalBtnActive]} 
                onPress={handleVocalVerify}
              >
                <Text style={styles.vocalBtnText}>
                  {shadowVerified ? "✅ Reflex Lock: Activated!" : "🎤 I Have Read This Aloud"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* 步骤 2：脑桥搭建检测 */
            <View style={styles.quizSection}>
              <Text style={styles.quizQuestion}>{(currentStep as any).question}</Text>
              
              {(currentStep as any).options.map((option: string, idx: number) => {
                const optionStyle: any[] = [styles.optionCard];
                const textStyle: any[] = [styles.optionText];

                if (quizAnswered) {
                  if (idx === (currentStep as any).correct) {
                    optionStyle.push(styles.optionCorrect);
                    textStyle.push(styles.textCorrect);
                  } else if (selectedOption === idx) {
                    optionStyle.push(styles.optionWrong);
                    textStyle.push(styles.textWrong);
                  }
                }

                return (
                  <TouchableOpacity 
                    key={idx} 
                    style={optionStyle} 
                    onPress={() => handleOptionSelect(idx)}
                    disabled={quizAnswered}
                  >
                    <Text style={textStyle}>{option}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* 答案解析提示区 */}
              {quizAnswered && (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>{(currentStep as any).explain}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部导航控制板 */}
      <View style={styles.footer}>
        {currentStepIndex === 0 ? (
          <TouchableOpacity 
            style={[styles.nextButton, !shadowVerified && styles.buttonDisabled]} 
            onPress={handleNext}
            disabled={!shadowVerified}
          >
            <Text style={styles.nextButtonText}>Next: Take Reflex Quiz ⚡</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.nextButton, !quizAnswered && styles.buttonDisabled]} 
            onPress={handleNext}
            disabled={!quizAnswered}
          >
            <Text style={styles.nextButtonText}>
              {currentLessonIndex < mcguffeyTasks.length - 1 ? "Complete & Next Lesson 🚀" : "Finish Book 1 🎉"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1-30课 目录导航模态弹窗 */}
      <Modal visible={menuVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>McGuffey's Book 1 (30 Lessons)</Text>
            <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.lessonList}>
            {mcguffeyTasks.map((task, index) => {
              const isCompleted = completedLessons.includes(task.id);
              const isCurrent = index === currentLessonIndex;
              return (
                <TouchableOpacity 
                  key={task.id} 
                  style={[
                    styles.lessonListItem, 
                    isCurrent && styles.itemCurrent,
                    isCompleted && styles.itemCompleted
                  ]}
                  onPress={() => loadLesson(index)}
                >
                  <Text style={styles.itemText}>{task.title}</Text>
                  <Text style={styles.itemStatus}>
                    {isCurrent ? "⭐️ Active" : isCompleted ? "✅ Done" : "⏳ Ready"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// 极简美学 UI 样式表
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  appTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  progressText: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  headerMeta: { fontSize: 12, color: '#7C3AED', marginTop: 6, fontWeight: '700' },
  menuButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F3F4F6', borderRadius: 8 },
  menuButtonText: { fontWeight: '700', color: '#4B5563', fontSize: 13 },
  progressBarBg: { height: 4, backgroundColor: '#E5E7EB', width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: '#10B981' },
  summaryRow: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: '#FFF' },
  summaryChip: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#C7D2FE' },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: '#4338CA', textTransform: 'uppercase' },
  summaryValue: { fontSize: 13, color: '#1F2937', marginTop: 4, fontWeight: '600' },
  cardContainer: { padding: 20, flexGrow: 1 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  badgeContainer: { alignSelf: 'flex-start', backgroundColor: '#EEF2F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  levelBadge: { fontSize: 11, fontWeight: '700', color: '#3B82F6', textTransform: 'uppercase' },
  lessonTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8 },
  learningSection: { flex: 1 },
  learnParagraph: { fontSize: 18, lineHeight: 28, fontWeight: '500', color: '#111827', backgroundColor: '#F9FAFB', padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3B82F6', marginVertical: 10 },
  shadowTip: { fontSize: 13, color: '#D97706', marginTop: 15, lineHeight: 18, fontWeight: '500' },
  vocalBtn: { marginTop: 20, backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  vocalBtnActive: { backgroundColor: '#10B981' },
  vocalBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  quizSection: { flex: 1 },
  quizQuestion: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 16, lineHeight: 22 },
  optionCard: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  optionText: { fontSize: 15, color: '#1F2937', fontWeight: '500' },
  optionCorrect: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  textCorrect: { color: '#065F46', fontWeight: '700' },
  optionWrong: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  textWrong: { color: '#991B1B', fontWeight: '700' },
  explanationBox: { backgroundColor: '#EFF6FF', padding: 16, borderRadius: 10, marginTop: 15, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  explanationText: { fontSize: 14, color: '#1E40AF', lineHeight: 20, fontWeight: '500' },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  nextButton: { backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EF4444', borderRadius: 6 },
  closeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  lessonList: { padding: 15 },
  lessonListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  itemCurrent: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  itemCompleted: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  itemText: { fontSize: 14, color: '#1F2937', fontWeight: '600', flex: 1, marginRight: 10 },
  itemStatus: { fontSize: 12, color: '#6B7280', fontWeight: '700' },
});
