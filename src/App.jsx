import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import zxcvbn from "zxcvbn";
import Confetti from "react-confetti";

export default function App() {
  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playBuzzer, setPlayBuzzer] = useState(false);
  const quizQuestions = [
    {
      id: 1,
      question: "What is phishing?",
      options: [
        "A fishing game",
        "Tricking people into giving info",
        "A secure email",
      ],
      correct: 1,
      explanation:
        "Phishing is a cyber attack where scammers trick you into sharing personal info like passwords.",
    },
    {
      id: 2,
      question: "Best way to avoid malware?",
      options: [
        "Click all links",
        "Update software regularly",
        "Share your Wi-Fi",
      ],
      correct: 1,
      explanation:
        "Regular updates patch security holes that malware loves to exploit.",
    },
    {
      id: 3,
      question: "What does 2FA mean?",
      options: [
        "Two Free Apps",
        "Two-Factor Authentication",
        "Twice Fast Access",
      ],
      correct: 1,
      explanation:
        "2FA adds an extra security layer, like a code sent to your phone.",
    },
    {
      id: 4,
      question: "What is ransomware?",
      options: ["A fun game", "Locks your files for ransom", "Free antivirus"],
      correct: 1,
      explanation:
        "Ransomware encrypts your files and demands payment to unlock them.",
    },
    {
      id: 5,
      question: "Why use strong passwords?",
      options: ["They look cool", "Harder to guess or crack", "Easier to type"],
      correct: 1,
      explanation:
        "Strong passwords protect against hackers trying to crack your accounts.",
    },
  ];

  // Buzzer Sound Effect
  useEffect(() => {
    if (playBuzzer) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, [playBuzzer]);

  const handleQuizAnswer = (id, selected) => {
    console.log(`Clicked question ${id}, option ${selected}`); // Debug log
    setQuizAnswers((prev) => ({ ...prev, [id]: selected }));
  };

  const submitQuiz = () => {
    console.log("Submitting quiz:", quizAnswers); // Debug log
    const score = quizQuestions.reduce(
      (acc, q) => acc + (quizAnswers[q.id] === q.correct ? 1 : 0),
      0
    );
    setQuizScore(score);
    if (score < quizQuestions.length) {
      setPlayBuzzer(true);
      setTimeout(() => setPlayBuzzer(false), 300); // Reset buzzer
    }
    if (score === quizQuestions.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const resetQuiz = () => {
    console.log("Resetting quiz"); // Debug log
    setQuizAnswers({});
    setQuizScore(null);
    setPlayBuzzer(false);
    setShowConfetti(false);
  };

  // Link Checker State
  const [linkUrl, setLinkUrl] = useState("");
  const [linkResult, setLinkResult] = useState(null);
  const [checkingLink, setCheckingLink] = useState(false);

  const checkLink = async () => {
    if (!linkUrl) return;
    setCheckingLink(true);
    setLinkResult(null);
    try {
      const API_KEY = "YOUR_GOOGLE_API_KEY_HERE";
      const response = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "cyber-hub", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url: linkUrl }],
            },
          }),
        }
      );
      const data = await response.json();
      if (data.threatMatches && data.threatMatches.length > 0) {
        setLinkResult({
          safe: false,
          threats: data.threatMatches.map((m) => m.threatType).join(", "),
        });
      } else {
        setLinkResult({ safe: true, message: "No threats detected!" });
      }
    } catch (error) {
      console.error("Link checker error:", error); // Debug log
      setLinkResult({
        safe: Math.random() > 0.5 ? true : false,
        message: "Demo mode: Random result (get API key for real checks)",
      });
    }
    setCheckingLink(false);
  };

  // Password Checker State
  const [password, setPassword] = useState("");
  const [passResult, setPassResult] = useState(null);

  const checkPassword = () => {
    if (!password) return;
    const result = zxcvbn(password);
    setPassResult({
      score: result.score,
      suggestions: result.feedback.suggestions,
      timeToCrack:
        result.crack_times_display.offline_slow_hashing_1e4_per_second,
    });
  };

  // Email Analyzer State
  const [emailText, setEmailText] = useState("");
  const [emailFlags, setEmailFlags] = useState([]);

  const analyzeEmail = () => {
    if (!emailText) return;
    const flags = [];
    const lowerText = emailText.toLowerCase();
    if (lowerText.includes("urgent") || lowerText.includes("immediate action"))
      flags.push("Urgent language - common scam tactic");
    if (
      lowerText.includes("click here") ||
      lowerText.match(/http[s]?:\/\/[^\s]+/g)
    )
      flags.push("Suspicious links detected");
    if (lowerText.includes("@fake.com") || !lowerText.includes("@"))
      flags.push("Suspicious sender domain");
    if (lowerText.includes("win prize") || lowerText.includes("free money"))
      flags.push("Too-good-to-be-true offers");
    setEmailFlags(
      flags.length ? flags : ["No obvious red flags! Still, verify sender."]
    );
  };

  const strengthColor = (score) => {
    const colors = ["red", "orange", "yellow", "lightgreen", "green"];
    return colors[score] || "gray";
  };

  const getFeedbackColor = (q, selected) => {
    if (selected === undefined) return "bg-indigo-50 border-transparent";
    return selected === q.correct
      ? "bg-green-100 border-green-500"
      : "bg-red-100 border-red-500";
  };

  const getOptionColor = (q, idx, selected) => {
    if (selected === undefined)
      return "bg-white border-gray-300 hover:bg-gray-50";
    if (idx === q.correct) return "bg-green-500 text-white";
    if (selected === idx) return "bg-red-500 text-white";
    return "bg-white border-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      {showConfetti && <Confetti />}
      {/* Header */}
      <header className="bg-indigo-800 text-white shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-bold"
          >
            Cyber Awareness Hub
          </motion.h1>
          <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 mt-4 sm:mt-0">
            {["Home", "Threats", "Tips", "Quiz", "Tools"].map((item) => (
              <motion.li
                key={item}
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <a
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-indigo-300 transition-all duration-300 relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-indigo-300 after:transition-all hover:after:w-full"
                >
                  {item}
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full inline-block mb-6 font-semibold shadow-md"
        >
          Proudly Made by Shaikh Aliakbar, Roll No. 6! 🚀
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-indigo-900 mb-6"
        >
          Stay Safe in the Digital World
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8"
        >
          Learn about cyber threats and how to protect yourself online.
          Knowledge is your best defense!
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-indigo-700 transition-colors"
        >
          Get Started
        </motion.button>
      </section>

      {/* Threats Section */}
      <section id="threats" className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h3
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-8 sm:mb-10 text-center"
          >
            Common Cyber Threats
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Phishing",
                desc: "Deceptive emails or messages tricking you into revealing sensitive information.",
              },
              {
                title: "Malware",
                desc: "Malicious software that can harm your device or steal data.",
              },
              {
                title: "Ransomware",
                desc: "Locks your files and demands payment for access.",
              },
            ].map((threat, index) => (
              <motion.div
                key={threat.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{
                  rotate: 1,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="bg-indigo-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
              >
                <h4 className="text-lg sm:text-xl font-semibold text-indigo-800 mb-4">
                  {threat.title}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  {threat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section id="tips" className="bg-indigo-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h3
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-8 sm:mb-10 text-center"
          >
            Tips for Staying Safe Online
          </motion.h3>
          <ul className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
            {[
              "Use strong, unique passwords for each account.",
              "Enable two-factor authentication (2FA).",
              "Be cautious with links and attachments in emails.",
              "Keep your software and devices updated.",
              "Use antivirus software and firewalls.",
            ].map((tip, index) => (
              <motion.li
                key={tip}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ x: 10, color: "#4f46e5" }}
                className="flex items-start cursor-pointer"
              >
                <span className="text-indigo-600 mr-3 sm:mr-4 text-lg">✔️</span>
                <span className="text-gray-700 text-sm sm:text-base">
                  {tip}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Interactive Quiz Section */}
      <section id="quiz" className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-8 sm:mb-10 text-center"
          >
            Test Your Knowledge - Fun Interactive Quiz! 🎉
          </motion.h3>
          <div className="max-w-2xl mx-auto">
            {quizQuestions.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: q.id * 0.1 }}
                className={`mb-8 p-4 sm:p-6 rounded-lg border-2 ${getFeedbackColor(
                  q,
                  quizAnswers[q.id]
                )}`}
              >
                <p className="font-semibold mb-4 text-sm sm:text-base">
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleQuizAnswer(q.id, idx)}
                      disabled={quizScore !== null}
                      whileHover={{ scale: quizScore === null ? 1.02 : 1 }}
                      animate={
                        quizScore !== null &&
                        quizAnswers[q.id] === idx &&
                        idx !== q.correct
                          ? { x: [0, -10, 10, -10, 0] }
                          : {}
                      }
                      transition={{ duration: 0.3 }}
                      className={`w-full p-2 sm:p-3 rounded text-left transition-colors disabled:cursor-not-allowed ${getOptionColor(
                        q,
                        idx,
                        quizAnswers[q.id]
                      )} ${
                        quizAnswers[q.id] === idx
                          ? "border-2 border-indigo-500"
                          : ""
                      }`}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {quizScore !== null && quizAnswers[q.id] !== q.correct && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 flex items-center space-x-2"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: 2, duration: 0.5 }}
                        className="text-2xl"
                      >
                        😢
                      </motion.span>
                      <p className="text-red-600 text-sm">
                        Wrong! Correct is: {q.options[q.correct]}
                      </p>
                    </motion.div>
                  )}
                  {quizScore !== null && (
                    <p className="mt-2 text-gray-600 text-sm italic">
                      {q.explanation}
                    </p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {Object.keys(quizAnswers).length === quizQuestions.length &&
              quizScore === null && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitQuiz}
                  className="block mx-auto bg-indigo-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold"
                >
                  Submit Quiz
                </motion.button>
              )}
            <AnimatePresence>
              {quizScore !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center mt-8 p-4 sm:p-6 bg-green-50 rounded-lg"
                >
                  <h4 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">
                    Score: {quizScore}/{quizQuestions.length} 🏆
                  </h4>
                  <p className="text-green-700 text-sm sm:text-base">
                    {quizScore === quizQuestions.length
                      ? "Perfect! You're a cyber pro! 🎊"
                      : quizScore > quizQuestions.length / 2
                      ? "Good job! Keep going! 👍"
                      : "Nice try! Review the tips! 📚"}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetQuiz}
                    className="mt-4 bg-indigo-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold"
                  >
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="bg-indigo-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-8 sm:mb-10 text-center"
          >
            Cyber Tools - Detect Scams Now!
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Link Checker Tool */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
            >
              <h4 className="text-lg sm:text-xl font-semibold mb-4 text-indigo-800">
                🔗 Link Checker
              </h4>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL to check..."
                className="w-full p-2 border border-gray-300 rounded mb-4 text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={checkLink}
                disabled={checkingLink}
                className="w-full bg-indigo-600 text-white py-2 rounded font-semibold disabled:opacity-50"
              >
                {checkingLink ? "Checking..." : "Check Safety"}
              </motion.button>
              <AnimatePresence>
                {linkResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded text-sm sm:text-base ${
                      linkResult.safe
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {linkResult.safe
                      ? linkResult.message
                      : `Threat detected: ${
                          linkResult.threats || "Potential phishing!"
                        }`}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Strength Tool */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
            >
              <h4 className="text-lg sm:text-xl font-semibold mb-4 text-indigo-800">
                🔑 Password Strength
              </h4>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPassword();
                }}
                placeholder="Enter password..."
                className="w-full p-2 border border-gray-300 rounded mb-4 text-sm sm:text-base"
              />
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300`}
                  style={{
                    width: `${(passResult?.score || 0) * 25}%`,
                    backgroundColor: strengthColor(passResult?.score || 0),
                  }}
                ></div>
              </div>
              {passResult && (
                <p className={`text-sm ${strengthColor(passResult.score)}`}>
                  Score: {passResult.score}/4 | Time to crack:{" "}
                  {passResult.timeToCrack}
                </p>
              )}
              {passResult?.suggestions.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {passResult.suggestions.slice(0, 2).map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Email Analyzer Tool */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
            >
              <h4 className="text-lg sm:text-xl font-semibold mb-4 text-indigo-800">
                📧 Email Scam Analyzer
              </h4>
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste email body here..."
                className="w-full p-2 border border-gray-300 rounded mb-4 h-24 text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeEmail}
                className="w-full bg-indigo-600 text-white py-2 rounded font-semibold"
              >
                Analyze for Scams
              </motion.button>
              <AnimatePresence>
                {emailFlags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-yellow-100 rounded text-sm sm:text-base"
                  >
                    <ul className="text-yellow-800 space-y-1">
                      {emailFlags.map((flag, i) => (
                        <li key={i}>⚠️ {flag}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-800 text-white py-6">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base">
            &copy; 2025 Cyber Awareness Hub. Created by Shaikh Aliakbar, Roll
            No. 6.
          </p>
        </div>
      </footer>
    </div>
  );
}
