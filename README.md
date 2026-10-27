Design and implementation of the modular knowledge management environment "AtomNote" using graph visualization
## Project structure

```text
WORLDLINE/
├── .worldline_data/
│   └── worldline.json
│
└── ATOM/
    ├── .atom_data/
    │   ├── atom.json
    │   ├── electrons.json
    │   ├── references.json
    │   └── links.json
    ├── __quiz__/
    ├── __cache__/
    └── ELECTRON.md
```

| Path | Role |
|---|---|
| `.worldline_data/` | Worldline metadata (hidden) |
| `.atom_data/` | Atom metadata (hidden) |
| `__quiz__/` | Quizzes && flashcards |
| `__cache__/` | Artefacts (imgs, PDF) |
| `*.md` | Electrons (note contet) |
## version 0.2

- [x] Structure Parser (0.1v) 
- [x] Simple MD editor (0.1v)

- Worldline:
    - [ ] Create
    - [x] Read
    - [ ] Update
    - [ ] Delete
- Atom:
    - [x] Create
    - [x] Read
    - [ ] Update
    - [x] Delete
- Electron:
    - [X] Create
    - [x] Read
    - [ ] Update
    - [ ] Delete
- Study Section:
    - Flashcards:
        - [x] Create
        - [x] Read
        - [x] Update
        - [x] Delete
        - [ ] Study Session
    - Quizzes:
        - [ ] Create
        - [ ] Read
        - [ ] Update
        - [ ] Delete
        - [ ] Study Session
- [ ] WorldlieGraph
- [ ] AtomGraph
