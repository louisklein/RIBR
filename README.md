# RIBR Research Toolkit: jsPsych Plugins for RIF and RIBR

This repository contains custom jsPsych plugins developed for conducting Retrieval-Induced Forgetting (RIF) and Retrieval-Induced Belief Revision (RIBR) experiments. The toolkit has been used across 7 experiments investigating how selective retrieval practice influences memory and belief systems.

**Co-developed with Becky Gilbert**, the core innovation is a single plugin that can measure memory interference (RIF) or belief revision (RIBR) depending on configuration.

### Built-in Error Detection

Our experiments required distinguishing between different error types to provide appropriate feedback. For example, when cued with "all c____ are animals", a response of "all cats" (incomplete structure) indicates different knowledge than "all dogs are animals" (wrong exemplar, correct structure).

Our plugin automatically classifies five error types:

```javascript
{
  stimulus: 'All c____ are animals',
  check_answers: true,
  check_sentence_structure: true,  // Catches incomplete responses
  similarity_threshold: 0.7,       // Handles spelling errors
  mistake_fn: function(response, solution, errorType) {
    // errorType automatically detected as:
    // 'structure' - incomplete sentence
    // 'exemplar' - wrong word but correct structure  
    // 'duplicate' - already submitted
    // 'format' - invalid characters/format
  }
}
```

### Adaptive Feedback System

The plugin provides progressive hinting because participants often know the answer but make minor errors. When someone writes "all crocodils are reptiles" (note the misspelling), they shouldn't get the same feedback as someone who writes "crocodiles". This approach also avoids re-presenting stimuli selected for retrieval practise or during free recall, which would otherwise introduce a confound of exposure frequency.

The plugin reveals additional letters after exemplar errors but provides different feedback for structural problems:

```javascript
{
  mistake_fn: function(response, solution, errorType) {
    if (errorType === 'exemplar') {
      // Reveals one more letter: "all cro____" becomes "all croc___"
    } else if (errorType === 'structure') {
      // Shows instruction to complete the sentence
    }
  }
}
```

### Flexible Validation Architecture

Different experiments need different answer criteria. RIF studies typically accept exact matches, while RIBR studies need to validate complete sentences with correct structure. We solved this with layered validation:

```javascript
// For RIF experiments - simple word matching
{
  check_answers: true,
  similarity_threshold: 0.8
}

// For RIBR experiments - sentence structure validation
{
  check_sentence_structure: true,
  check_fn: function(response, solution) {
    // Custom validation logic
    // Return true/false for accept/reject
  },
  structure_error_message: 'Please type the complete sentence'
}
```

### String Similarity Scoring

Spelling errors shouldn't invalidate otherwise correct responses. We implemented a flexible Levenshtein distance calculation to score partial matches. The `similarity_threshold` parameter controls tolerance:

```javascript
{
  similarity_threshold: 0.9,  // Strict: only minor typos accepted
  similarity_threshold: 0.7,  // Moderate: more spelling variation allowed
  similarity_threshold: 0.5   // Lenient: substantial differences accepted
}
```

### Multi-Response Collection

Free recall experiments need to collect multiple responses while preventing duplicates and invalid entries. Our plugin handles this with real-time validation and organised display:

```javascript
{
  print_responses: true,              // Enable multiple response mode
  check_duplicates: true,             // Prevent repeated answers
  case_sensitive_duplicates: false,   // "Cat" and "cat" treated as same
  validation_fn: function(response, category) {
    // Check if response belongs to target category
    return validateCategoryMembership(response, category);
  }
}
```

Responses automatically organise into columns as participants submit them, providing clear visual feedback about their progress. The number of columns can be explicitly set but it will wrap into multiple columns by default when previous responses hit the edge of the viewport. Alternatively, previous responses can be set to fade out of view after time-out or the list of previous responses reaches a count of _n_.

## Instructions Plugin with Animated Text

The standard jsPsych instructions plugin appears instantly, which can feel abrupt and by presenting information all at once, may allow students to skim-read or skip-over instructions. To address this, we added a 'typewriter' animation because it creates a potentially more engaging experience while maintaining experimental control over timing and presentation. The animation plugin works well with the recall plugin, but is not necessary.

The animation engine preserves HTML formatting while rendering character-by-character:

```javascript
{
  type: 'instructions',
  pages: ['Welcome to the <strong>memory experiment</strong>'],
  animate_lines: true,
  animation_delay: 60,  // milliseconds between characters
}
```

A cute side-effect of the way we implemented the animation is that emboldened text or linebreaks induce a little delay (because underneath the hood, markdown syntax is being parsed) that breaks-up the animation flow and adds to overall reading engagement. The animation system also handles edge cases like participants pressing keys during typewriter rendering by queuing navigation events until animation completes.

## Technical Implementation

### Performance Optimisation

The Levenshtein distance algorithm runs in O(n×m) time, which becomes slow for long responses. We optimised for typical experimental scenarios (responses under 50 characters) with early termination conditions:

```javascript
function calculateSimilarity(str1, str2) {
  if (!str1 && !str2) return 1.0;        // Both empty
  if (!str1 || !str2) return 0.0;        // One empty
  if (str1 === str2) return 1.0;         // Exact match - skip calculation
  
  // Only calculate distance for non-identical strings
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return (maxLength - distance) / maxLength;
}
```

### Data Output Structure

The plugin captures error type metadata for potential analysis:

```json
{
  "responses": [
    {
      "response": "all cats are animals",
      "rt": 3247,
      "valid": true,
      "similarity_score": 1.0,
      "error_type": null
    }
  ],
  "view_history": "Page-by-page timing data",
  "validation_results": "Success/failure codes for each attempt"
}
```

### Browser Compatibility

All functionality uses vanilla JavaScript (ES6+) without external dependencies but it currently optimised for use with jsPsych version 6.2. Limited testing and support has occurred for jsPsych versions >7.0.

## Configuration Examples

### Classic Retrieval-Induced Revision (RIF) Study
```javascript
var rif_trial = {
  type: 'cued-recall',
  stimulus: 'Fruit: Or____',
  check_answers: true,
  similarity_threshold: 0.8,
  trial_duration: 15000
};
```

### Retrieval-Induced Belief Revision (RIBR) Adaptation  
```javascript
var belief_trial = {
  type: 'cued-recall',
  stimulus: 'All cr_____ are reptiles',
  check_sentence_structure: true,
  structure_error_message: 'Please type the complete sentence',
  check_fn: validateBeliefStatement,
  mistake_fn: adaptiveBeliefHinting
};
```

### Free Recall with Category Validation
```javascript
var free_recall = {
  type: 'cued-recall',
  stimulus: 'Name as many animals as possible:',
  print_responses: true,
  validation_fn: function(response) {
    return isAnimal(response) ? true : 'category';
  },
  trial_duration: 60000
};
```

## Files

- `jspsych-recall-plugin_v3.js` - Advanced cued recall with validation
- `jspsych-instructions-plugin_v2.js` - Instructions with typewriter animation  
- `experiment-styling.css` - Consistent visual formatting

---

**Developed by**: Louis Klein and Becky Gilbert  (github@becky-gilbert)
**License**: Open source for research use
**Citation**:

Klein, L., & Gilbert, R. (2025). jsPsych plugin for recall tasks (Version 3.0) [Computer software]. _GitHub_. https://github.com/louisklein/RIBR
