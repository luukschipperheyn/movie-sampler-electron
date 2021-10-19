const movieSampler = require("movie-sampler");
var open = require("open");
const { ipcRenderer } = require('electron')
const ffmpegPath = require('ffmpeg-static-electron').path;

process.once('loaded', () => {
    window.addEventListener('message', evt => {
        if (evt.data.type === 'select-dirs') {
            ipcRenderer.send('select-dirs')
        }
    })
})


window.addEventListener('DOMContentLoaded', () => {
    console.log('hi from preload')
    const $ = require("jquery");

    $(document).on('click', 'a[href^="http"]', function (event) {
        event.preventDefault();
        open(this.href);
    });

    const $video = $('#video-input')
    const $subs = $('#subs-input')
    const $margin = $('#margin-input')
    const $videoValue = $('#video-value')
    const $subsValue = $('#subs-value')
    const $outValue = $('#out-value')
    const $marginValue = $('#margin-value')

    $video.on('change', () => {
        const video = $video[0].files[0].path;
        $videoValue.text(video)
    })
    $subs.on('change', () => {
        const subs = $subs[0].files[0].path;
        $subsValue.text(subs)
    })
    $margin.on('change', () => {
        $marginValue.text(`margin: ${$margin.val()} seconds`)
    })

    let out = ''

    ipcRenderer.on('dir-selected', (event, arg) => {
        console.log('got async reply', arg)
        out = arg
        $outValue.text(out)
    })


    $("#form").on("submit", async (e) => {
        e.preventDefault();

        const $button = $("#form-button");
        $button.prop("disabled", true);

        const $output = $("#output");
        $output.text("");

        const video = $video[0].files[0].path;
        const subs = $subs[0].files[0].path;
        const margin = $margin.val();

        const onProcessItem = (sub) =>
            $output.text(`processing item:\n${JSON.stringify(sub, null, 2)}`);

        try {
            console.log({ video, subs, out })
            await movieSampler({ video, subs, out, onProcessItem, ffmpegPath, margin });
            $output.text("done");
        } catch (e) {
            console.log(e);
            $output.text(e.message);
        }
        $button.prop("disabled", false);
    });
})

