
+function() {
    var _extra = {
        ru: {
            welWelcome: 'Добро пожаловать в Иволга ПРО!',
            welDescr: 'Пакет офисных приложений для создания, редактирования и просмотра текстовых документов, электронных таблиц и презентаций',
            portalEmptyTitle: 'Получите еще больше возможностей для работы используя облачный офис Иволга ПРО'
        }
    };

    !!_extra[utils.inParams.lang] &&
        utils.fn.extend(utils.Lang, _extra[utils.inParams.lang]);
}();
