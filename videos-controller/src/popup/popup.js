$(() => {
    $("input").keyup(() => {
        debugger
        $("h2").text("Hi"+ $("input").val());
    })
})