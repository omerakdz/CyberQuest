# Task: Build AI Lab – Interactive Artificial Intelligence Games

I want to introduce a new section called **AI Lab** into my existing educational computer lessons application.

IMPORTANT: AI Lab is NOT available or implemented yet. You need to build this feature from scratch within the existing project.

The goal is to teach children about artificial intelligence through interactive experiments, puzzles and games.

I want you to use **Phaser 3** to create actual interactive 2D games, not just static pages or basic quizzes.

## 1. Inspect the existing project

Before implementing anything:

- Inspect the complete project architecture.
- Identify the frontend framework, routing and styling system.
- Look at how existing educational sections and games are structured.
- Check whether Phaser 3 is already installed.
- Examine how Race Rush, Cyber Detective and Fake or Fact are integrated.
- Reuse existing components and architecture wherever possible.

Do not rebuild unrelated parts of the application.

## 2. Phaser 3 integration

If Phaser 3 is already installed, reuse the existing installation.

Otherwise, install Phaser 3.

Requirements:

- Use separate Phaser scenes for each game.
- Create reusable game components and utilities.
- Integrate Phaser with the existing frontend.
- Support responsive gameplay.
- Ensure smooth animations and transitions.
- Clean up Phaser instances when leaving a game.
- Optimize performance for school computers.

## 3. Build these three games

### GAME 1: AI Trainer – Train Your Own AI

Category: Artificial intelligence and machine learning.

Create an interactive game where children experience how AI learns from examples.

Story:
The player works in an AI laboratory and must train a robot to recognize different objects.

Gameplay:

- Show different images of objects, animals, food and vehicles.
- Players must sort the examples into the correct categories.
- The AI learns from the examples provided.
- After training, the player tests the AI with new images.
- The AI attempts to recognize and categorize the objects.
- Sometimes the AI makes mistakes.
- Players must investigate why the AI made mistakes and improve its training data.

Include:

- An interactive training interface.
- Image classification.
- Training and testing phases.
- A visible AI learning progress indicator.
- Different difficulty levels.
- Feedback explaining how training examples influence AI results.

Important:
Make the learning simulation understandable and visually clear. Explain that this is a simplified simulation of machine learning, not a real AI model being trained.

### GAME 2: AI or Human? – Who Created This?

Category: AI awareness and critical thinking.

Create an interactive investigation game where children explore content that could have been created by AI or humans.

Gameplay:

- Display short fictional texts, illustrations, stories and creative examples.
- Players must decide whether the content could have been created by AI or a human.
- Include different rounds with varying difficulty.
- After each decision, reveal the intended origin of the example.
- Explain which clues might suggest AI generation.
- Include examples where it is genuinely difficult or impossible to know from appearance alone.

Include:

- An interactive gallery.
- Different content categories.
- A scoring system.
- Increasing difficulty.
- Explanations after each answer.
- A final score and learning summary.

Important educational rule:
Do not teach children that AI-generated content can always be identified by looking at it. Explain that AI and human-created content can look very similar and that reliable verification may be necessary.

Use clearly labelled fictional examples and do not make unsupported claims about the origin of real-world content.

### GAME 3: Robot Programmer – Teach the Robot

Category: Algorithms, logical thinking and AI concepts.

Create a puzzle game where children program a robot to complete tasks inside an AI laboratory.

Story:
The laboratory robot has no idea what to do. The player must give it instructions to complete different missions.

Gameplay:

- Display a grid-based laboratory.
- Place a robot at a starting position.
- Add obstacles, targets, doors and collectible objects.
- Players must create a sequence of instructions.
- Available instructions include:
  - Move forward.
  - Turn left.
  - Turn right.
  - Repeat.
- The robot executes the instructions one by one.
- Players must reach the target while avoiding obstacles.
- Later levels introduce more complex challenges.

Include:

- Drag-and-drop or clickable instruction blocks.
- An execution button.
- Step-by-step robot animations.
- A reset button.
- Multiple levels.
- Increasing difficulty.
- A limited number of instructions in certain challenges.

Educational objective:
Teach children how algorithms work and how computers follow instructions. Explain that traditional programmed robots and AI systems are not exactly the same thing.

## 4. AI Lab landing page

Create a dedicated AI Lab landing page containing three game cards.

Each card must include:

- Game title.
- Game illustration or preview.
- Short description.
- Difficulty indicator.
- Play button.

The landing page should feel like entering a futuristic AI research laboratory.

## 5. Visual design

Use a consistent futuristic laboratory theme.

Visual direction:

- Dark navy and blue backgrounds.
- Neon blue, purple and cyan accents.
- Friendly robot characters.
- Laboratory environments.
- Holographic interfaces.
- Interactive computer screens.
- Animated circuits and digital effects.
- Smooth transitions and visual feedback.

The design should be modern, playful and suitable for children.

Avoid making the interface too complicated or overly technical.

## 6. Educational requirements

The purpose is to introduce children to artificial intelligence in an accessible way.

Teach them:

- What artificial intelligence is.
- How machine learning works at a basic level.
- Why AI needs examples and training data.
- Why AI sometimes makes mistakes.
- How AI-generated content differs from human-created content.
- Why AI results should not always be trusted.
- How algorithms and instructions work.
- The difference between traditional programming and AI.

Use simple language and practical examples.

## 7. Technical requirements

- Phaser 3 must handle the actual game rendering and interactions.
- Use the existing frontend for navigation and menus.
- Use TypeScript if the project already uses it.
- Keep each game modular.
- Implement functional game progression.
- Add scoring and completion screens.
- Add appropriate feedback after every answer.
- Do not create placeholder buttons.
- Do not create fake interactions.
- Reuse the existing project architecture.

The games should work without requiring external AI API keys or paid AI services. Simulate the learning concepts locally where necessary.

## 8. Implementation order

Work in these phases:

1. Inspect the existing project.
2. Explain the current architecture and implementation plan.
3. Create the AI Lab landing page.
4. Implement AI Trainer.
5. Implement AI or Human?
6. Implement Robot Programmer.
7. Test all three games.
8. Fix bugs and verify the complete experience.

IMPORTANT:

AI Lab does NOT exist yet. Build the complete feature from scratch, including its navigation, landing page and three fully playable Phaser games.

Do not just create a visual mockup. The actual playable games are the main priority.

Preserve all existing functionality, including Race Rush, Cyber Detective, Fake or Fact and other educational sections.
