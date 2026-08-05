/* Netlify Identity callback handler.
   Les emails Netlify Identity renvoient vers le site avec un jeton dans
   l'URL (#invite_token, #recovery_token, #confirmation_token,
   #email_change_token). Sans ce traitement, la page d'accueil s'affiche
   simplement et l'utilisateur ne peut pas définir son mot de passe. */
(function () {
  'use strict';

  var hash = window.location.hash || '';
  var hasIdentityToken = /(?:^#|[&#])(invite_token|recovery_token|confirmation_token|email_change_token)=/.test(hash);

  if (!hasIdentityToken) return;

  console.info('[Netlify Identity] Jeton détecté dans l’URL, traitement en cours.');

  import('https://esm.sh/@netlify/identity')
    .then(function (identity) {
      var handleAuthCallback = identity && (
        identity.handleAuthCallback ||
        (identity.default && identity.default.handleAuthCallback)
      );
      if (typeof handleAuthCallback !== 'function') {
        throw new Error('handleAuthCallback() est introuvable dans @netlify/identity.');
      }
      return handleAuthCallback();
    })
    .then(function (result) {
      if (!result) {
        console.warn('[Netlify Identity] Aucun résultat retourné par handleAuthCallback().');
        return;
      }

      var email = result.user && result.user.email ? result.user.email : 'utilisateur';
      console.info('[Netlify Identity] Callback traité avec succès :', result.type, email);
      window.location.replace('/admin/');
    })
    .catch(function (error) {
      console.error('[Netlify Identity] Impossible de traiter le jeton d’authentification.', error);
    });
})();
