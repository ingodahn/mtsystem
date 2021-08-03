export const relations = [
    {
        sourceType: 'subject',
        targetType: 'subject',
        id: 'isBelow', 
        name: 'is a part of', 
        inverse: 'has as a part',
        description: "Every complete description of TARGET must contain a complete description of SOURCE."
    },
    {
        sourceType: 'subject',
        targetType: 'subject',
        id: 'requires',
        name: 'requires knowledge from',
        inverse: 'is used in subject',
        description: "Learning about some content in SOURCE requires some knowledge from subject TARGET"
    },
    {   sourceType: 'concept',
        targetType: 'concept',
        id: 'isBelow', 
        name: 'is a kind of', 
        inverse: 'is an abstraction of',
        description: "Every SOURCE can be interpreted as an instance of TARGET in a canonical way."
    },
    {   sourceType: 'unit',
        targetType: 'unit',
        id: 'isBelowxx', 
        name: 'is a part of', 
        inverse: 'has a part',
        description: "Every complete description of TARGET must contain a complete description of SOURCE."
    },
    {
        sourceType: 'theorem',
        targetType: 'theorem',
        id: 'isBelow', 
        name: 'helps proving', 
        inverse: 'can be proved using',
        description: "A proof of \"TARGET\" can use \"SOURCE\"."
    },
    {
        sourceType: 'question',
        targetType: 'question',
        id: 'isBelow', 
        name: 'helps answering', 
        inverse: 'can be answered best, after answering',
        description: "Answering SOURCE will help answering TARGET."
    },
    {
        sourceType: 'unit',
        targetType: 'unit',
        id: 'requiresxx',
        name: 'requires knowledge from',
        inverse: 'is used in unit',
        description: "Learning about some content in SOURCE requires some knowledge from unit TARGET"
    },
    {
        sourceType: 'unit',
        targetType: 'question',
        id: 'answers',
        name: 'answers question',
        inverse: 'is answered in',
        description: "Reading SOURCE will answer TARGET"
    }
];