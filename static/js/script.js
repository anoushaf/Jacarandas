(function($) {
  // Use wysiwyg editor.
  $("#description").trumbowyg();

  // Show answer on course page.
  $("[data-answer-reveal]").on("click", function() {
    $(this).addClass("d-none");
    $("[data-answer]").removeClass("d-none");
  });

  // Add confirm dialog for delete actions.
  $("[data-form-delete]").on("submit", function(event) {
    var confirmDelete = confirm(($(this).data("form-delete")));
    if (!confirmDelete) {
      event.preventDefault();
    }
  });

  // Show preview of avatar image in admin.
  $("[data-avatar-image]").on("change", function() {
    if ($(this).val()) {
      $("[data-preview-image]").html(`<img class="jcr-avatar" src="/images/avatars/${$(this).val()}" alt="">`)
    } else {
      $("[data-preview-image]").html("");
    }
  });

  // Show preview of course image in admin.
  $("[data-course-image]").on("change", function() {
    if ($(this).val()) {
      $("[data-preview-image]").html(`<img class="mt-3" src="/images/courses/${$(this).val()}" alt="">`)
    } else {
      $("[data-preview-image]").html("");
    }
  });

  // Dismiss flash message.
  $("[data-flash-alert]").on("click", function() {
    $(this).remove();
  })
})(jQuery)

function onYouTubeIframeAPIReady() {
  new YT.Player("player");
}
