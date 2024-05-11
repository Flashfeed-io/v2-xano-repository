$(document).ready(function () {
  $("#cc_writer-demo-concept").click(function () {
    var target = $(this).siblings(".cc_writer-demo-rich-text").first();
    if (target.length) {
      target.empty();
      var text = `🎞 Concept / Storyline:
        The storyline follows an exhausted everyman protagonist working tirelessly in his cluttered home office late into the night, battling work-related stress. As fatigue consumes him, he struggles to stay awake. Suddenly, he picks up his phone and taps on a notification from JANDI, causing a burst of confetti to shower down around him. This magical moment represents a turning point as the chaos on his desk is transformed into a perfectly organized workspace, thanks to JANDI's features. The ad showcases how JANDI can revolutionize the protagonist's work-life balance, alleviating stress and improving productivity.
        
        🏆 Pitching this concept:
        From a psychological standpoint, this ad captures the viewer's attention and piques their interest by tapping into their own experiences of work-related exhaustion and overwhelm. The relatable depiction of the protagonist's fatigue resonates with viewers, creating empathy and a desire for a solution. The magical confetti moment serves as a visual hook, capturing the viewer's curiosity and showcasing the transformative power of JANDI. By demonstrating how JANDI can provide an organized and efficient work environment, the ad appeals to viewers' aspirations for a stress-free work life, ultimately driving them to consider JANDI as a valuable tool.
        
        🎥 Scenes Needed [2]:
        ‣ Scene 1: Exhausted workspace - The protagonist, working late into the night, is shown in his cluttered home office, visibly tired and on the verge of falling asleep. The scene conveys his overwhelming workload and stress.
        ‣ Scene 2: Magical confetti transformation - The protagonist picks up his phone and taps on a JANDI notification. Suddenly, confetti showers from above, filling the room. As the confetti falls, the clutter on the desk magically rearranges into an organized workspace. This transformative scene represents the positive impact JANDI can have on productivity and work-life balance.
        
        📸 Key Shots:
        • Close-up of the protagonist's fatigued face, showing his exhaustion and stress.
        • Wide shot of the 
        cluttered workspace, emphasizing the chaotic and overwhelming environment.
        • Close-up of the protagonist's hand picking up the phone, indicating a moment of curiosity and potential change.
        • Overhead shot of confetti showering down, creating a visually captivating moment of transformation.
        • Wide shot revealing the magically organized workspace, highlighting the effectiveness of JANDI's features.`;
      animateTyping(target, text);
      $(this).remove();
    }
  });

  function animateTyping(element, text) {
    var formattedText = formatText(text);
    var lines = formattedText.split("\n");
    var lineIndex = 0;
    var charIndex = 0;
    var interval = setInterval(function () {
      if (lineIndex < lines.length) {
        var line = lines[lineIndex];
        if (charIndex < line.length) {
          var charsToShow = line.substring(charIndex, charIndex + 5); // Adjust the number of characters to show per interval
          element.append(charsToShow);
          charIndex += 5; // Adjust the increment value to match the number of characters shown
        } else {
          element.append("<br>");
          lineIndex++;
          charIndex = 0;
          element.scrollTop(element.prop("scrollHeight")); // Scroll to the bottom
        }
      } else {
        clearInterval(interval);
      }
    }, 10); // Adjust typing speed by changing the interval (in milliseconds)
  }

  function formatText(text) {
    var formattedText = text;
    formattedText = formattedText.replace(/\[(.*?)\]/g, "<$1>"); // Convert [tag] to HTML tags
    return formattedText;
  }
});
