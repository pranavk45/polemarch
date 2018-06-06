from __future__ import unicode_literals
import logging
import uuid
from vstutils.utils import raise_context, ModelHandlers
from .base import BModel, BQuerySet, models


logger = logging.getLogger('polemarch')


class HookHandlers(ModelHandlers):
    when_types_names = dict(
        on_execution="Before start task",
        after_execution="After end task",
        on_user_add="When new user register",
        on_user_upd="When user update data",
        on_user_del="When user was removed",
        on_object_add="When new Polemarch object was added",
        on_object_upd="When Polemarch object was updated",
        on_object_del="When Polemarch object was removed",
    )
    when_types = when_types_names.keys()

    def get_handler(self, obj):
        return self[obj.type](obj, self.when_types, **self.opts(obj.type))

    @raise_context(AttributeError, exclude=True)
    def handle(self, obj, when, message):
        logger.debug("Send hook {} triggered by {}.".format(obj.name, when))
        return getattr(self.get_handler(obj), when)(message)

    def validate(self, obj):
        return self.get_handler(obj).validate()


class HooksQuerySet(BQuerySet):
    use_for_related_fields = True

    def when(self, when):
        return self.filter(enable=True).filter(models.Q(when=when) | models.Q(when=None))

    def execute(self, when, message):
        for hook in self.when(when):
            with raise_context():
                hook.run(when, message)


class Hook(BModel):
    # pylint: disable=no-member
    objects = models.Manager.from_queryset(HooksQuerySet)()
    handlers = HookHandlers("HOOKS", "'type' needed!")
    name       = models.CharField(max_length=512, default=uuid.uuid1)
    type       = models.CharField(max_length=32, null=False)
    when       = models.CharField(max_length=32, null=True, default=None)
    enable     = models.BooleanField(default=True)
    recipients = models.TextField()

    @property
    def reps(self):
        return self.recipients.split(' | ')

    def run(self, when='on_execution', message=None):
        return (
            self.handlers.handle(self, when, message)
            if self.when is None or self.when == when else ''
        )
