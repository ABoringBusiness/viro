# Viro Natural Language Understanding

This module provides natural language understanding capabilities for AR applications, enabling them to process and understand user commands and queries.

## Features

- Multiple NLU engines (OpenAI, Dialogflow, ML Kit, rule-based)
- Intent recognition for common AR commands
- Entity extraction for identifying objects, colors, directions, etc.
- Conversation management for maintaining context
- Intent handling for executing actions based on user commands
- Sentiment analysis for understanding user emotions
- Customizable intents and entities for domain-specific applications

## Usage

```javascript
import {
  ViroNaturalLanguageUnderstanding,
  NLUEngine,
  ViroIntentHandler,
  ViroConversationManager,
  ViroEntityExtractor,
  EntityType
} from '@reactvision/react-viro';

// Basic usage
const processUserCommand = async (text) => {
  // Initialize NLU
  const nlu = ViroNaturalLanguageUnderstanding.getInstance({
    engine: NLUEngine.RULE_BASED,
    confidenceThreshold: 0.5
  });
  
  // Process the text
  const response = await nlu.processQuery(text);
  
  console.log('Recognized intent:', response.intent.name);
  console.log('Confidence:', response.intent.confidence);
  console.log('Entities:', response.intent.entities);
  
  return response;
};

// Advanced usage with conversation management
const setupConversation = () => {
  // Initialize conversation manager
  const conversationManager = ViroConversationManager.getInstance({
    nluOptions: {
      engine: NLUEngine.ML_KIT,
      enableEntityRecognition: true
    },
    maxHistorySize: 50,
    autoEndConversation: true,
    inactivityTimeout: 300000 // 5 minutes
  });
  
  // Set up event listeners
  conversationManager.on('message', (message) => {
    console.log(`${message.isUserMessage ? 'User' : 'Assistant'}: ${message.text}`);
  });
  
  conversationManager.on('stateChange', (state) => {
    console.log('Conversation state changed:', state);
  });
  
  // Start a new conversation
  conversationManager.startNewConversation();
  
  return conversationManager;
};

// Process user message in conversation
const handleUserMessage = async (conversationManager, text) => {
  const response = await conversationManager.processMessage(text);
  
  // Check if there's an action to perform
  if (response.action) {
    performAction(response.action, response.actionParams);
  }
  
  return response;
};

// Custom intent handling
const setupIntentHandlers = () => {
  const intentHandler = ViroIntentHandler.getInstance();
  
  // Register handler for placing objects
  intentHandler.registerHandler('place_object', async (intent, context) => {
    // Extract object entity
    const objectEntity = intent.entities.find(e => e.type === 'object');
    const object = objectEntity ? objectEntity.value : 'cube';
    
    return {
      responseText: `Placing a ${object} in the scene.`,
      success: true,
      action: 'place_object',
      actionParams: { objectType: object }
    };
  });
  
  // Register handler for removing objects
  intentHandler.registerHandler('remove_object', async (intent, context) => {
    // Extract object entity
    const objectEntity = intent.entities.find(e => e.type === 'object');
    
    if (objectEntity) {
      return {
        responseText: `Removing the ${objectEntity.value}.`,
        success: true,
        action: 'remove_object',
        actionParams: { objectType: objectEntity.value }
      };
    } else {
      return {
        responseText: 'Removing all objects from the scene.',
        success: true,
        action: 'remove_all_objects'
      };
    }
  });
  
  return intentHandler;
};

// Entity extraction
const extractEntities = async (text) => {
  const entityExtractor = ViroEntityExtractor.getInstance({
    entityTypes: [
      EntityType.OBJECT,
      EntityType.COLOR,
      EntityType.DIRECTION,
      EntityType.SIZE
    ]
  });
  
  const entities = await entityExtractor.extractEntities(text);
  
  console.log('Extracted entities:', entities);
  return entities;
};
```

## API Reference

### ViroNaturalLanguageUnderstanding

#### Static Methods

##### `getInstance(options?: NLUOptions): ViroNaturalLanguageUnderstanding`

Get the singleton instance of the NLU module.

#### Instance Methods

##### `setOptions(options: Partial<NLUOptions>): void`

Update NLU options.

##### `initialize(): Promise<boolean>`

Initialize the NLU system.

##### `processQuery(query: string): Promise<NLUResponse>`

Process a natural language query.

##### `addCustomIntent(intent: { name: string; examples: string[]; entities?: string[] }): void`

Add a custom intent.

##### `removeCustomIntent(intentName: string): void`

Remove a custom intent.

##### `getCustomIntents(): any[]`

Get all custom intents.

##### `addContext(context: { name: string; parameters?: { [key: string]: any }; lifespan?: number }): void`

Add context to the conversation.

##### `removeContext(contextName: string): void`

Remove context from the conversation.

##### `clearContext(): void`

Clear all conversation context.

##### `getContext(): any[]`

Get the current conversation context.

##### `release(): void`

Release resources.

### ViroIntentHandler

#### Static Methods

##### `getInstance(): ViroIntentHandler`

Get the singleton instance of the intent handler.

#### Instance Methods

##### `registerHandler(intentName: string, handler: IntentHandlerFunction): void`

Register an intent handler.

##### `registerHandlers(handlers: { [intentName: string]: IntentHandlerFunction }): void`

Register multiple intent handlers.

##### `unregisterHandler(intentName: string): void`

Unregister an intent handler.

##### `setFallbackHandler(handler: IntentHandlerFunction): void`

Set the fallback handler for unrecognized intents.

##### `handleIntent(response: NLUResponse, additionalContext?: { [key: string]: any }): Promise<IntentHandlerResult>`

Handle an NLU response.

##### `getConversationState(): { [key: string]: any }`

Get the current conversation state.

##### `setConversationState(state: { [key: string]: any }): void`

Set the conversation state.

##### `updateConversationState(updates: { [key: string]: any }): void`

Update the conversation state.

##### `clearConversationState(): void`

Clear the conversation state.

### ViroConversationManager

#### Static Methods

##### `getInstance(options?: ConversationOptions): ViroConversationManager`

Get the singleton instance of the conversation manager.

#### Instance Methods

##### `setOptions(options: Partial<ConversationOptions>): void`

Update conversation options.

##### `processMessage(message: string): Promise<ConversationMessage>`

Process a user message.

##### `endConversation(): void`

End the conversation.

##### `startNewConversation(): void`

Start a new conversation.

##### `getState(): ConversationState`

Get the current conversation state.

##### `getMessageHistory(): ConversationMessage[]`

Get the conversation message history.

##### `getConversationId(): string`

Get the conversation ID.

##### `getConversationState(): { [key: string]: any }`

Get the conversation state data.

##### `updateConversationState(updates: { [key: string]: any }): void`

Update the conversation state data.

##### `release(): void`

Release resources.

### ViroEntityExtractor

#### Static Methods

##### `getInstance(options?: EntityExtractionOptions): ViroEntityExtractor`

Get the singleton instance of the entity extractor.

#### Instance Methods

##### `setOptions(options: Partial<EntityExtractionOptions>): void`

Update entity extraction options.

##### `initialize(): Promise<boolean>`

Initialize the entity extractor.

##### `extractEntities(text: string, options?: Partial<EntityExtractionOptions>): Promise<NLUEntity[]>`

Extract entities from text.

##### `addCustomEntity(entityDef: { type: string; values: string[]; patterns?: string[] }): void`

Add a custom entity definition.

##### `removeCustomEntity(entityType: string): void`

Remove a custom entity definition.

##### `getCustomEntities(): any[]`

Get all custom entity definitions.

##### `release(): void`

Release resources.

## NLU Engines

### Rule-Based

A simple pattern-matching engine that recognizes intents based on example phrases. This engine works entirely on-device and doesn't require an internet connection.

### ML Kit

Uses Google's ML Kit for natural language processing. This engine can work on-device for basic functionality, with more advanced features requiring an internet connection.

### Dialogflow

Uses Google's Dialogflow for advanced natural language understanding with context management and rich responses. Requires an internet connection and a Dialogflow project.

### OpenAI

Uses OpenAI's API for state-of-the-art natural language understanding. Requires an internet connection and an OpenAI API key.

## Intent Recognition

The module comes with pre-defined intents for common AR commands:

- `greeting`: Recognize greetings like "hello" or "hi"
- `farewell`: Recognize farewells like "goodbye" or "bye"
- `place_object`: Recognize commands to place objects like "place a cube here"
- `remove_object`: Recognize commands to remove objects like "remove this cube"
- `move_object`: Recognize commands to move objects like "move this cube left"
- `rotate_object`: Recognize commands to rotate objects like "rotate this cube right"
- `scale_object`: Recognize commands to scale objects like "make this cube bigger"
- `change_color`: Recognize commands to change object colors like "make this cube red"
- `take_photo`: Recognize commands to take photos like "take a picture"
- `record_video`: Recognize commands to record videos like "start recording"
- `stop_recording`: Recognize commands to stop recording like "stop recording"
- `help`: Recognize help requests like "what can you do"
- `identify_object`: Recognize object identification requests like "what is this"
- `measure_distance`: Recognize distance measurement requests like "how far is that object"
- `get_information`: Recognize information requests like "tell me about this"

## Entity Extraction

The module can extract various types of entities from text:

- `PERSON`: Person names
- `LOCATION`: Locations
- `ORGANIZATION`: Organizations
- `DATETIME`: Date and time expressions
- `MONEY`: Monetary values
- `PERCENTAGE`: Percentages
- `PHONE_NUMBER`: Phone numbers
- `EMAIL`: Email addresses
- `URL`: URLs
- `QUANTITY`: Quantities with units
- `COLOR`: Colors
- `DIRECTION`: Directions (left, right, north, etc.)
- `OBJECT`: 3D objects
- `SURFACE`: Surfaces (table, floor, wall, etc.)
- `SIZE`: Sizes (small, large, etc.)

## Conversation Management

The conversation manager maintains the state of the conversation, including:

- Message history
- Conversation context
- User profile
- Conversation state (idle, processing, responding, ended, error)

It also handles events like:

- `message`: Emitted when a message is added to the conversation
- `response`: Emitted when the assistant responds to a user message
- `stateChange`: Emitted when the conversation state changes
- `conversationStart`: Emitted when a new conversation starts
- `conversationEnd`: Emitted when a conversation ends
- `error`: Emitted when an error occurs

## Demo

The module includes a demo component `ViroNLUDemo` that showcases the natural language understanding capabilities.

## License

MIT