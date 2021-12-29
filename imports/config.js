export { relations, defaultType, defaultRelation, defaultNode };
const relations = [
    {
        sourceType: 'subject',
        targetType: 'subject',
        id: 'SisBelowS', 
        name: 'is a part of', 
        inverse: 'has as a part',
        description: "Every complete description of TARGET must contain a complete description of SOURCE."
    },
    {
        sourceType: 'subject',
        targetType: 'subject',
        id: 'requires',
        name: 'requires knowledge from',
        inverse: 'is used in',
        description: "Learning about some content in SOURCE requires some knowledge from subject TARGET"
    },
    {   sourceType: 'concept',
        targetType: 'concept',
        id: 'CisBelowC', 
        name: 'is a kind of', 
        inverse: 'is an abstraction of',
        description: "Every SOURCE can be interpreted as an instance of TARGET in a canonical way."
    },
    {   sourceType: 'concept',
        targetType: 'concept',
        id: 'exampleOf', 
        name: 'is an example of', 
        inverse: 'has example',
        description: "The concept SOURCE provides an example for the concept TARGET."
    },
    {
        sourceType: 'theorem',
        targetType: 'theorem',
        id: 'TisBelowT', 
        name: 'helps proving', 
        inverse: 'can be proved using',
        description: "A proof of \"TARGET\" can use \"SOURCE\"."
    },
    {
        sourceType: 'theorem',
        targetType: 'theorem',
        id: 'isSpecial', 
        name: 'is a special case of', 
        inverse: 'is a generalization of',
        description: "\"SOURCE\" is an immediate consequence of the more general \"TARGET\"."
    },
    
    {
        sourceType: 'person',
        targetType: 'person',
        id: 'PbuildsOnP', 
        name: 'builds on', 
        inverse: 'inspired',
        description: "Work of SOURCE builds on the work of TARGET."
    },
    
    {
        sourceType: 'person',
        targetType: 'person',
        id: 'PinspiredP', 
        name: 'inspired', 
        inverse: 'builds on',
        description: "Work of SOURCE inspired the work of TARGET."
    },
    {
        sourceType: 'person',
        targetType: 'subject',
        id: 'PcontributedToS', 
        name: 'contributed to', 
        inverse: 'was developed by',
        description: "SOURCE made key contributions to TARGET."
    },
    {
        sourceType: 'person',
        targetType: 'concept',
        id: 'PcontributedToC', 
        name: 'contributed to', 
        inverse: 'was developed by',
        description: "SOURCE contributed to the development of TARGET."
    },
    {
        sourceType: 'theorem',
        targetType: 'subject',
        id: 'isAppliedIn', 
        name: 'is applied in', 
        inverse: 'applies',
        description: "The theorem SOURCE is applied to solve problems in subject TARGET."
    },
    {
        sourceType: 'concept',
        targetType: 'subject',
        id: 'isUsedIn', 
        name: 'is used in', 
        inverse: 'uses',
        description: "Concept SOURCE is important in subject TARGET."
    },
];

const defaultType = 'subject';
const defaultRelation = {
    subject: 'SisBelowS',
    concept: 'CisBelowC',
    theorem: 'TisBelowT',
    person: 'PinspredP',
};
const defaultNode = {
    subject: 'Mathematics',
    concept: 'Vector space',
    theorem: 'Fundamental theorem of calculus',
    person: 'Claudius Ptolemy'
};