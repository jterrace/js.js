function reportMessage(s) {
    console.log(s);
    $('pre#console_log').append(s + "\n");
}

function assert(v) {
    if (!v) {
        throw "Assertion failed";
    }
}
