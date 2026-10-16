# From Person of Interest to real AI-surveillance

An interactive, presenter-led lesson for AI and machine learning students. It contains 12 scenes and a closing scene, designed for a roughly 40-minute live discussion. The interface is in English. The diagrams use invented examples and do not collect data or call any online service.

## Start the presentation

Open `index.html` in a modern browser. The presentation works directly from the local file system and does not need a backend, build step, package install, or internet connection.

If your browser restricts local video playback, use a simple local server from the repository root:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/`. Python is only needed for this optional server method.

## Controls

| Control | Action |
| --- | --- |
| Right arrow | Next scene |
| Left arrow | Previous scene |
| Space | Next reveal or interaction step; then next scene |
| Next / Previous buttons | Step forward / move to previous scene |
| Fullscreen button | Toggle browser fullscreen, when supported |
| `P` | Toggle the optional presenter panel and timer |
| Escape | Close the video or presenter panel |

When a button or video control has focus, its own keyboard behavior takes priority. Interactive source nodes, quiz answers, decisions, and reset controls can all be used with a mouse or keyboard focus.

## Add optional images and video

No media files are bundled. Files placed in the two asset directories are ignored by Git by default, except for their `.gitkeep` placeholders. Use only files you have the right to present or distribute. The interface shows a designed fallback when a file is absent.

| File | Used in |
| --- | --- |
| `assets/images/poi-surveillance.jpg` | Opening atmosphere in scene 1 |
| `assets/images/poi-machine.jpg` | Main fiction still in scene 2 |
| `assets/images/poi-server-room.jpg` | Subdued infrastructure texture behind the scene 9 ontology |
| `assets/images/poi-number.jpg` | Obscured background texture in the fictional scene 12 case |
| `assets/video/poi-intro.mp4` | Optional opening clip in scene 1 |
| `assets/video/poi-system-surveillance.mp4` | Optional fictional transition clip in scene 4 |
| `assets/video/poi-number.mp4` | Optional clip in scene 12 |

Put images in `assets/images/` and videos in `assets/video/`, keeping the filenames above or updating their paths in `index.html`. Video loads and starts only after a click. The native player provides pause and volume controls. Closing the player pauses playback. The presentation remains usable if every media file is missing.

The supplied scene 12 still contains its own faces and labels. It is deliberately blurred and darkened so it does not depict the invented subject or provide evidence for the illustrative score. Do not remove that treatment without reviewing the image and the fictional-case disclaimer. Local media files should only be committed or distributed after their rights have been confirmed.

## Edit text and scenes

Most visible copy lives in `index.html`. Quiz questions and answers, source statuses, metadata captions, and governance descriptions live near their interaction code in `js/presentation.js`. Search for a scene ID such as `scene-7` to find its HTML, and search the corresponding scene comment in the JavaScript file. Keep all visible text in natural English.

Each `<section class="scene">` is one scene. For a simple sequential reveal, add `class="reveal" data-step="1"` to an element, then increase that scene's entry in the `maxSteps` array near the top of `js/presentation.js`. Step numbers start at 1. If you add or remove a scene, keep the section order and `maxSteps` array aligned. The displayed scene count and progress bar update automatically. Scenes with custom interactions, such as the quiz and network diagrams, also have scene-specific functions in `js/presentation.js` that should be updated when their structure changes.

The appearance is controlled by `css/style.css`. There are no third-party fonts, JavaScript packages, or network dependencies.

To keep CSS readable after edits, run `node scripts/format-css.mjs`.

For a local regression check, run `node tests/presentation.test.mjs` with Node 24 and Chrome installed. Add `--screenshots` to save visual captures in `.qa-output/`; this directory is ignored by Git.

## Suggested live pacing

Use the opening and 2011 scenes for about 5 minutes; data and metadata for 9 minutes; system building and capability quiz for 8 minutes; networks, Palantir, and agents for 8 minutes; governance and The Number for 8 minutes; and the closing discussion for 2 minutes. The presenter panel shows elapsed time, but pacing is entirely up to the presenter.

The `87%` risk score in The Number is invented. It is not a valid estimate of any person's future conduct. The Person of Interest comparison is conceptual: Palantir is a real data and analysis platform, not the fictional Machine. PRISM and the bulk telephone metadata program were distinct programs discussed in the 2013 disclosures.

## Background sources

These are reading references for the instructor; the presentation never loads them during use.

- [Privacy and Civil Liberties Oversight Board: report on the telephone records program](https://www.pclob.gov/Oversight)
- [NIST: face recognition, accuracy, and false positives](https://www.nist.gov/speech-testimony/facial-recognition-technology-part-iii-ensuring-commercial-transparency-accuracy)
- [Palantir: Ontology](https://www.palantir.com/platforms/ontology/)
- [OpenAI: using tools in agent workflows](https://developers.openai.com/api/docs/guides/tools)

## Repository layout

```text
index.html
css/style.css
js/presentation.js
assets/images/
assets/video/
```
